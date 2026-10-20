import { Container, Typography } from '@mui/material';

export function OperatorHomePage() {
  return (
    <Container component="main" sx={{ py: 4 }}>
      <Typography variant="h1" fontSize="2rem">Sistema da sorveteria</Typography>
      <Typography>Você entrou no ambiente interno.</Typography>
    </Container>
  );
}

