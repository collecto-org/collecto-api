import Gender from '../models/gender.js';

// Obtener todos los géneros
export const getAllGenders = async (req, res) => {
  try {
    const genders = await Gender.find({});
    res.status(200).json(genders);
  } catch (error) {
    console.error("Error al obtener géneros:", error);
    res.status(500).json({ message: "Error al obtener géneros" });
  }
};

// Obtener un género por ID
export const getGenderById = async (req, res) => {
  try {
    const gender = await Gender.findById(req.params.id).populate('gender');
    if (!gender) {
      return res.status(404).json({ message: "Género no encontrado" });
    }
    res.status(200).json(gender);
  } catch (error) {
    console.error("Error al obtener género:", error);
    res.status(500).json({ message: "Error al obtener género" });
  }
};

// Crear un nuevo género
export const createGender = async (req, res) => {
  try {
    const { label, code } = req.body;

    const newGender = new Gender({ label, code });
    await newGender.save();

    res.status(201).json(newGender);
  } catch (error) {
    console.error("Error al crear género:", error);
    res.status(500).json({ message: "Error al crear género" });
  }
};

// Eliminar un género
export const deleteGender = async (req, res) => {
  try {
    const gender = await Gender.findById(req.params.id);
    if (!gender) {
      return res.status(404).json({ message: "Género no encontrado" });
    }

    await gender.remove();
    res.status(200).json({ message: "Género eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar género:", error);
    res.status(500).json({ message: "Error al eliminar género" });
  }
};


// Actualizar un género
export const updateGender = async (req, res) => {
    try {
      const { label, code } = req.body;
      const gender = await Gender.findById(req.params.id);
  
      if (!gender) {
        return res.status(404).json({ message: "Género no encontrado" });
      }
  
      gender.label = label || gender.label;
      gender.code = code || gender.code;
  
      const updatedGender = await gender.save();
  
      res.status(200).json(updatedGender);
    } catch (error) {
      console.error("Error al actualizar género:", error);
      res.status(500).json({ message: "Error al actualizar género" });
    }
  };
  