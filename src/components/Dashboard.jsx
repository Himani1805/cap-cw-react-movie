import { Box, FormControl, Input, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Form } from 'react-router-dom'
import {MovieApp} from '../components/Movie'
export default function Dashboard() {
    
  return (
    <Box> 
        <VStack>
            <Box>
                < MovieApp />
            </Box>
        </VStack>
    </Box>
    
  )
}
