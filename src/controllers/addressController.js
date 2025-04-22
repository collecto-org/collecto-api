import { getCountries, getStates, getCities } from '../services/geonames';

// Obtener la lista de países
export const fetchCountries = async (req, res) => {
  try {
    const countries = await getCountries();
    res.status(200).json(countries); // Enviar los países al frontend
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los países', error: error.message });
  }
};

// Obtener los estados de un país
export const fetchStates = async (req, res) => {
  const { countryCode } = req.params;  // El código del país como parámetro
  try {
    const states = await getStates(countryCode);
    res.status(200).json(states); // Enviar los estados al frontend
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los estados', error: error.message });
  }
};

// Obtener las ciudades de un estado
export const fetchCities = async (req, res) => {
  const { stateCode } = req.params;  // El código del estado como parámetro
  try {
    const cities = await getCities(stateCode);
    res.status(200).json(cities); // Enviar las ciudades al frontend
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las ciudades', error: error.message });
  }
};
