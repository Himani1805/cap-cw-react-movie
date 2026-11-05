import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Box, Grid, Heading, Text, Input, Image, Center } from "@chakra-ui/react";
import { RiMovieLine, RiSearchLine } from "react-icons/ri";

const DEFAULT_SEARCH = "avengers";

const MovieCard = ({ movie }) => {
    const hasPoster = movie.Poster && movie.Poster !== "N/A";

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
                {hasPoster ? (
                    <Image
                        src={movie.Poster}
                        alt={movie.Title}
                        position="absolute"
                        inset="0"
                        w="100%"
                        h="100%"
                        objectFit="cover"
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
                <Text mt={1} fontSize="12px" color="#78716c" textTransform="capitalize" noOfLines={1}>
                    {movie.Type} · {movie.Year}
                </Text>
            </Box>
        </Box>
    );
};

const MovieApp = () => {
    const [movieData, setMovieData] = useState([]);
    const [status, setStatus] = useState("Loading movies...");
    const debounceTimer = useRef(null);
    const requestId = useRef(0);

    const fetchData = async (query) => {
        const term = (query || DEFAULT_SEARCH).trim() || DEFAULT_SEARCH;
        const id = requestId.current + 1;
        requestId.current = id;
        setStatus("Loading movies...");

        try {
            const response = await axios.get(
                `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&apikey=5a133d4e`
            );
            if (id !== requestId.current) {
                return;
            }
            const movies = response.data.Search;
            if (response.data.Response === "False" || !movies) {
                setMovieData([]);
                setStatus("No movies found.");
                return;
            }
            setMovieData(movies);
            setStatus("");
        } catch {
            if (id !== requestId.current) {
                return;
            }
            setMovieData([]);
            setStatus("Could not load movies. Try again.");
        }
    };

    useEffect(() => {
        fetchData(DEFAULT_SEARCH);
        return () => clearTimeout(debounceTimer.current);
    }, []);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchData(value);
        }, 500);
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
                    <Grid
                        templateColumns={{
                            base: "repeat(2, minmax(0, 1fr))",
                            md: "repeat(3, minmax(0, 1fr))",
                            lg: "repeat(4, minmax(0, 1fr))",
                            xl: "repeat(5, minmax(0, 1fr))"
                        }}
                        gap={{ base: 3, md: 4 }}
                    >
                        {movieData.map((movie) => (
                            <MovieCard key={movie.imdbID} movie={movie} />
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export { MovieApp };
