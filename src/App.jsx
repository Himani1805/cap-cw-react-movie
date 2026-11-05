import Dashboard from "./components/Dashboard";
import { Box } from "@chakra-ui/react";

document.title = "Movie List";

export default function App() {
    return (
        <Box bg="#f6f3ee" minH="100vh">
            <Dashboard />
        </Box>
    );
}
