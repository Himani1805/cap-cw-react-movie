import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Box, Flex, Grid, Heading, Text, Input, Image, Center } from "@chakra-ui/react";
import { RiMovieLine, RiSearchLine } from "react-icons/ri";

const DEFAULT_SEARCH = "avengers";
const VISIBLE_COUNT = 12;
const SEARCH_PAGES = 5;
const SEARCH_DELAY = 500;
const PAGE_GAP = 700;

const debounce = (fn, delay) => {
    let timer;
    const wrapped = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    wrapped.cancel = () => clearTimeout(timer);
    return wrapped;
};

const throttle = (fn, delay) => {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last < delay) {
            return;
        }
        last = now;
        fn(...args);
    };
};

const latestYear = (year) => {
    const text = String(year || "");
    const years = text.match(/\d{4}/g);
    if (!years) {
        return 0;
    }
    if (/[–-]\s*$/.test(text)) {
        return new Date().getFullYear();
    }
    return Math.max(...years.map(Number));
};

const detailValue = (value) => (value && value !== "N/A" ? value : "");

const posterLoads = (url) =>
    new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });

const MovieCard = ({ movie, showWithoutPoster }) => {
    const poster = detailValue(movie.Poster);
    const [posterOk, setPosterOk] = useState(Boolean(poster));
    const rating = detailValue(movie.imdbRating);
    const meta = [rating ? `★ ${rating}` : "", movie.Year].filter(Boolean).join(" · ");

    if (!posterOk && !showWithoutPoster) {
        return null;
    }

    return (
        <Box
            bg="white"
            border="1px solid #e7e1d8"
            borderRadius="10px"
            overflow="hidden"
            h="100%"
            transition="transform 0.15s ease, box-shadow 0.15s ease"
            _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(40, 30, 20, 0.08)" }}
        >
            <Box position="relative" pt="148%" bg="#efeae3">
                {posterOk ? (
                    <Image
                        src={poster}
                        alt={movie.Title}
                        position="absolute"
                        inset="0"
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        onError={() => setPosterOk(false)}
                    />
                ) : (
                    <Center position="absolute" inset="0" color="#a8a29e">
                        <RiMovieLine size="36px" />
                    </Center>
                )}
            </Box>
            <Box px={3} py={3}>
                <Heading
                    as="h2"
                    fontSize={["13px", "15px"]}
                    fontWeight="650"
                    lineHeight="1.35"
                    noOfLines={2}
                    minH="2.7em"
                >
                    {movie.Title}
                </Heading>
                <Text mt={1} fontSize="12px" color="#78716c" noOfLines={1}>
                    {meta}
                </Text>
            </Box>
        </Box>
    );
};

const withDetails = async (movies) =>
    Promise.all(
        movies.map(async (movie) => {
            try {
                const response = await axios.get(
                    `https://www.omdbapi.com/?i=${encodeURIComponent(movie.imdbID)}&apikey=5a133d4e`
                );
                const data = response.data;
                if (data.Response === "False") {
                    return movie;
                }
                return {
                    ...movie,
                    imdbRating: data.imdbRating
                };
            } catch {
                return movie;
            }
        })
    );

const pageNumbers = (current, count) => {
    if (count <= 5) {
        return Array.from({ length: count }, (_, index) => index + 1);
    }
    const start = Math.max(1, Math.min(current - 2, count - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
};

const MovieApp = () => {
    const [movieData, setMovieData] = useState([]);
    const [showWithoutPoster, setShowWithoutPoster] = useState(false);
    const [status, setStatus] = useState("Loading movies...");
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const requestId = useRef(0);
    const catalogRef = useRef([]);
    const hideBrokenRef = useRef(true);
    const fetchDataRef = useRef(() => {});
    const goToPageRef = useRef(() => {});
    const debouncedSearch = useMemo(
        () => debounce((value) => fetchDataRef.current(value), SEARCH_DELAY),
        []
    );
    const throttledPage = useMemo(
        () => throttle((nextPage) => goToPageRef.current(nextPage), PAGE_GAP),
        []
    );

    const showPage = async (movies, pageNumber, hideBroken, id) => {
        const start = (pageNumber - 1) * VISIBLE_COUNT;
        const picked = movies.slice(start, start + VISIBLE_COUNT);
        if (!picked.length) {
            setMovieData([]);
            setShowWithoutPoster(false);
            setPageCount(0);
            setStatus("No movies found.");
            return;
        }
        const detailed = await withDetails(picked);
        if (id !== requestId.current) {
            return;
        }
        setMovieData(detailed);
        setShowWithoutPoster(!hideBroken);
        setPage(pageNumber);
        setPageCount(Math.ceil(movies.length / VISIBLE_COUNT));
        setStatus("");
    };

    const fetchData = async (query) => {
        const typed = (query || "").trim();
        const term = typed || DEFAULT_SEARCH;
        const hideBroken = !typed;
        const id = requestId.current + 1;
        requestId.current = id;
        hideBrokenRef.current = hideBroken;
        catalogRef.current = [];
        setPage(1);
        setPageCount(0);
        setStatus("Loading movies...");

        try {
            const first = await axios.get(
                `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&page=1&apikey=5a133d4e`
            );
            if (id !== requestId.current) {
                return;
            }
            const firstPage = first.data.Search;
            if (first.data.Response === "False" || !firstPage) {
                setMovieData([]);
                setShowWithoutPoster(false);
                setStatus("No movies found.");
                return;
            }

            const total = Number(first.data.totalResults) || firstPage.length;
            const omdbPages = Math.min(SEARCH_PAGES, Math.ceil(total / 10));
            const rest = await Promise.all(
                Array.from({ length: omdbPages - 1 }, (_, index) =>
                    axios
                        .get(
                            `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&page=${index + 2}&apikey=5a133d4e`
                        )
                        .catch(() => null)
                )
            );
            if (id !== requestId.current) {
                return;
            }

            const seen = new Set();
            const collected = [];
            [first, ...rest].forEach((response) => {
                (response?.data?.Search || []).forEach((movie) => {
                    if (!seen.has(movie.imdbID)) {
                        seen.add(movie.imdbID);
                        collected.push(movie);
                    }
                });
            });

            let ordered = [...collected].sort((a, b) => latestYear(b.Year) - latestYear(a.Year));
            if (hideBroken) {
                const checks = await Promise.all(
                    ordered.map((movie) => {
                        const url = detailValue(movie.Poster);
                        return url ? posterLoads(url) : Promise.resolve(false);
                    })
                );
                if (id !== requestId.current) {
                    return;
                }
                ordered = ordered.filter((_, index) => checks[index]);
            }

            catalogRef.current = ordered;
            await showPage(ordered, 1, hideBroken, id);
        } catch {
            if (id !== requestId.current) {
                return;
            }
            setMovieData([]);
            setShowWithoutPoster(false);
            setPageCount(0);
            setStatus("Could not load movies. Try again.");
        }
    };

    const goToPage = (nextPage) => {
        if (nextPage < 1 || nextPage > pageCount || nextPage === page || status) {
            return;
        }
        const id = requestId.current + 1;
        requestId.current = id;
        setStatus("Loading movies...");
        window.scrollTo({ top: 0, behavior: "smooth" });
        showPage(catalogRef.current, nextPage, hideBrokenRef.current, id);
    };

    fetchDataRef.current = fetchData;
    goToPageRef.current = goToPage;

    useEffect(() => {
        fetchData("");
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearchChange = (event) => {
        debouncedSearch(event.target.value);
    };

    return (
        <Box minH="100vh" bg="#f6f3ee">
            <Box
                as="header"
                position="sticky"
                top="0"
                zIndex="10"
                bg="#1c1917"
                color="#faf7f2"
                px={{ base: 4, md: 6 }}
                py={{ base: 4, md: 5 }}
            >
                <Box maxW="1120px" mx="auto">
                    <Heading as="h1" fontSize={{ base: "22px", md: "28px" }} fontWeight="650" letterSpacing="-0.3px">
                        Movie List
                    </Heading>
                    <Text mt={1} mb={4} fontSize="13px" color="#d6d3d1">
Find a film by its title.
                    </Text>
                    <Box position="relative" maxW={{ base: "100%", md: "440px" }}>
                        <Box position="absolute" left="12px" top="11px" color="#a8a29e" zIndex="1">
                            <RiSearchLine size="18px" />
                        </Box>
                        <Input
                            type="search"
                            placeholder="Search movies..."
                            onChange={handleSearchChange}
                            h="42px"
                            pl="38px"
                            bg="white"
                            color="#1c1917"
                            border="none"
                            borderRadius="8px"
                            fontSize="15px"
                            _placeholder={{ color: "#a8a29e" }}
                            focusBorderColor="#b42318"
                        />
                    </Box>
                </Box>
            </Box>

            <Box as="main" maxW="1120px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
                {status ? (
                    <Text textAlign="center" color="#57534e" py={8}>
                        {status}
                    </Text>
                ) : (
                    <>
                        <Grid
                            templateColumns={{
                                base: "repeat(2, minmax(0, 1fr))",
                                md: "repeat(4, minmax(0, 1fr))"
                            }}
                            gap={{ base: 3, md: 4 }}
                        >
                            {movieData.map((movie) => (
                                <MovieCard key={movie.imdbID} movie={movie} showWithoutPoster={showWithoutPoster} />
                            ))}
                        </Grid>
                        {pageCount > 1 && (
                            <Flex as="nav" aria-label="Movie pages" justify="center" align="center" gap={2} mt={6} wrap="wrap">
                                <Box
                                    as="button"
                                    type="button"
                                    onClick={() => throttledPage(page - 1)}
                                    disabled={page === 1}
                                    px={3}
                                    h="36px"
                                    borderRadius="8px"
                                    border="1px solid #e7e1d8"
                                    bg="white"
                                    color="#1c1917"
                                    fontSize="14px"
                                    cursor={page === 1 ? "default" : "pointer"}
                                    opacity={page === 1 ? 0.4 : 1}
                                >
                                    Previous
                                </Box>
                                {pageNumbers(page, pageCount).map((number) => (
                                    <Box
                                        key={number}
                                        as="button"
                                        type="button"
                                        aria-current={number === page ? "page" : undefined}
                                        onClick={() => throttledPage(number)}
                                        w="36px"
                                        h="36px"
                                        borderRadius="8px"
                                        border="1px solid"
                                        borderColor={number === page ? "#1c1917" : "#e7e1d8"}
                                        bg={number === page ? "#1c1917" : "white"}
                                        color={number === page ? "#faf7f2" : "#1c1917"}
                                        fontSize="14px"
                                        cursor="pointer"
                                    >
                                        {number}
                                    </Box>
                                ))}
                                <Box
                                    as="button"
                                    type="button"
                                    onClick={() => throttledPage(page + 1)}
                                    disabled={page === pageCount}
                                    px={3}
                                    h="36px"
                                    borderRadius="8px"
                                    border="1px solid #e7e1d8"
                                    bg="white"
                                    color="#1c1917"
                                    fontSize="14px"
                                    cursor={page === pageCount ? "default" : "pointer"}
                                    opacity={page === pageCount ? 0.4 : 1}
                                >
                                    Next
                                </Box>
                            </Flex>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export { MovieApp };
