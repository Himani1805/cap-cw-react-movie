import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Box, Grid, Heading, Text, Input, Image, Card, CardBody, Stack, Center, VStack } from "@chakra-ui/react";
import { RiMovieLine } from "react-icons/ri";


const MovieCard = ({ movie }) => {
    return (
        // <Box p={4} borderWidth="1px" borderRadius="md">
        <Card maxW='sm'>
            <CardBody>
                {
                    movie.Poster !== 'N/A' ?
                        <Image src={movie.Poster} width={"100%"} h={"160px"} />
                        :
                        <Center>
                            <RiMovieLine size={'60%'} />
                        </Center>
                }

                <Stack mt='6' spacing='3' align={'center'}>
                    <Heading size="sm">{movie.Title}</Heading>
                    <Text>{movie.Type}</Text>
                    <Text>{movie.Year}</Text>
                    <Text>{movie.imdbID}</Text>
                </Stack>
            </CardBody>
        </Card>


        // </Box>
    )
};

const MovieApp = () => {
    const [movieData, setMovieData] = useState([]);
    let debounceTimer = useRef;
    
    useEffect(() => {
        fetchData();

    }, []);

    const fetchData = async (query) => {
        const searchApi = `https://www.omdbapi.com/?s=${query}&apikey=5a133d4e`
        const defaultApi = `https://www.omdbapi.com/?s=${undefined}&apikey=5a133d4e`
        try {
            const response = await axios.get(query ? searchApi : defaultApi, {

            });
            // console.log(response.data.Search);
            setMovieData(response.data.Search);


        } catch (error) {
            console.error("Error fetching movie data:", error);
        }
    };

    const handleSearchChange = (event) => {

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchData(event.target.value);
        }, 1000);
    };
    return (
        <Box p={4}>
            <VStack>
                <Heading mb={4}>Movie List</Heading>
                <Input
                    type="text"
                    placeholder="Search movies..."
                    onChange={handleSearchChange}
                    mb={4}
                    width={'fit-content'}
                />
            </VStack>

            <Grid templateColumns={["100%", "repeat(2, 1fr)", "repeat(4, 1fr)"]} gap={4}>
                {movieData?.map((movie, index) => (
                    <MovieCard key={index} movie={movie} />

                ))}
            </Grid>
        </Box>
    );
};

export  {MovieApp}
