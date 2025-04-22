import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const GEO_API_URL = 'http://api.geonames.org/';
const USERNAME = process.env.GEO_NAMES_USERNAME;

export const getCountries = async () => {
  try {
    const response = await axios.get(`${GEO_API_URL}countryInfoJSON`, {
      params: {
        username: USERNAME,
      },
    });
    return response.data.geonames; // Retorna los países
  } catch (error) {
    console.error('Error al obtener los países:', error);
    throw error;
  }
};

// Obtener estados de un país
export const getStates = async (countryCode) => {
  try {
    const response = await axios.get(`${GEO_API_URL}childrenJSON`, {
      params: {
        geonameId: countryCode, // El código de país que recibes
        username: USERNAME,
      },
    });
    return response.data.geonames; // Retorna los estados
  } catch (error) {
    console.error('Error al obtener los estados:', error);
    throw error;
  }
};

// Obtener ciudades de un estado
export const getCities = async (stateCode) => {
  try {
    const response = await axios.get(`${GEO_API_URL}searchJSON`, {
      params: {
        stateCode,
        maxRows: 100, // Puedes ajustar este número
        username: USERNAME,
      },
    });
    return response.data.geonames; // Retorna las ciudades
  } catch (error) {
    console.error('Error al obtener las ciudades:', error);
    throw error;
  }
};
