import MenuGroup from '../models/menuGroup.js';

export const createMenuGroup = async (req, res) => {
  try {
    const { code, name, description, isActive } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Los campos Código y Nombre son obligatorios.' });
    }

    const existingGroup = await MenuGroup.findOne({ code });
    if (existingGroup) {
      return res.status(409).json({ error: 'Ya existe un grupo de menús con ese código.' });
    }

    const menuGroup = new MenuGroup({ code, name, description, isActive });
    const savedGroup = await menuGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuGroups = async (req, res) => {
  try {
    const groups = await MenuGroup.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMenuGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await MenuGroup.findById(id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo de menús no encontrado.' });
    }

    Object.assign(group, req.body);
    const updatedGroup = await group.save();
    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMenuGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await MenuGroup.findById(id);

    if (!group) {
      return res.status(404).json({ error: 'Grupo de menús no encontrado.' });
    }

    await group.deleteOne();
    res.status(200).json({ message: 'Grupo de menús eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
