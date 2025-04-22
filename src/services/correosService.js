import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CORREOS_API_URL = 'https://localizador.correos.es/canonico/eventos_envio_servicio_auth';
const USERNAME = process.env.CORREOS_USERNAME;
const PASSWORD = process.env.CORREOS_PASSWORD;

const authHeader = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export const getTrackingInfo = async (trackingCode) => {
  try {
    const response = await axios.get(`${CORREOS_API_URL}/${trackingCode}`, {
      headers: {
        'Authorization': authHeader,
      },
      params: {
        codIdioma: 'ES',
        indUltEvento: 'N',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al consultar el tracking de Correos:', error.message);
    throw error;
  }
};