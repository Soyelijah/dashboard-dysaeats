import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Box,
  H1,
  H2,
  H3,
  Text,
  Illustration,
  IllustrationProps,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
  Icon,
  Card,
  Badge,
} from '@adminjs/design-system';

const Dashboard = () => {
  const [data, setData] = useState({
    usersCount: 0,
    restaurantsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = new ApiClient();

  useEffect(() => {
    setLoading(true);
    api
      .getDashboard()
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((e) => {
        setError('No se pudieron cargar los datos del dashboard');
        setLoading(false);
        console.error(e);
      });
  }, []);

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Text>Cargando...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box position="relative" overflow="hidden">
        <Box bg="white" p="x3" mb="x3" style={{ borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <H1 mb="x4">Panel de Administración DysaEats</H1>
          <Text mb="x4" fontSize="lg">
            Bienvenido al panel de administración de DysaEats. Aquí podrás gestionar todos los aspectos de tu plataforma.
          </Text>

          <Box mb="x4" flex flexDirection={['column', 'column', 'row']} flexWrap="wrap">
            <Card width={[1, 1, 1/4]} m="x2" as="a" href="/admin/resources/User">
              <Box p="x3">
                <H3>Usuarios</H3>
                <Text mb="default">{data.usersCount} usuarios registrados</Text>
                <Badge>Gestionar</Badge>
              </Box>
            </Card>
            
            <Card width={[1, 1, 1/4]} m="x2" as="a" href="/admin/resources/Restaurant">
              <Box p="x3">
                <H3>Restaurantes</H3>
                <Text mb="default">{data.restaurantsCount} restaurantes activos</Text>
                <Badge>Gestionar</Badge>
              </Box>
            </Card>
            
            <Card width={[1, 1, 1/4]} m="x2" as="a" href="/admin/resources/Order">
              <Box p="x3">
                <H3>Pedidos</H3>
                <Text mb="default">{data.ordersCount} pedidos realizados</Text>
                <Badge>Gestionar</Badge>
              </Box>
            </Card>
            
            <Card width={[1, 1, 1/4]} m="x2" as="a" href="/admin/resources/Payment">
              <Box p="x3">
                <H3>Ingresos</H3>
                <Text mb="default">${data.totalRevenue} total</Text>
                <Badge>Detalles</Badge>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;