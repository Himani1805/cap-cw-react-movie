import { Box, FormControl, Input, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Form } from 'react-router-dom'

export default function Dashboard() {
    const [movies, setMovies ] = useState([])
    function handleChange(e){
        console.log(e)
    }
  return (
    <Box> 
        <VStack>
            <Box>
                <FormControl>
                    < Input onClick= {handleChange} placeholder = "Search Movie"/>
                </FormControl>
            </Box>
        </VStack>
    </Box>
    
  )
}
