import Menu from '../models/menu.js';
import MenuGroup from '../models/menuGroup.js';



//import menuRoutes from './routes/menuRoutes.js';
//import menuGroupRoutes from './routes/menuGroupRoutes.js';

//app.use('/api/menus', menuRoutes);
//app.use('/api/menu-groups', menuGroupRoutes);


export const createMenu = async (req, res) => {
  try {
    const { label, route, menuGroup, icon, order, isActive } = req.body;

    if (!label || !route || !menuGroup) {
      return res.status(400).json({ error: 'Los campos Label, Route y MenuGroup son obligatorios.' });
    }

    const existingGroup = await MenuGroup.findById(menuGroup);
    if (!existingGroup) {
      return res.status(404).json({ error: 'El grupo de menús referenciado no existe.' });
    }

    const menu = new Menu({ label, route, menuGroup, icon, order, isActive });
    const savedMenu = await menu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate('menuGroup');
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado.' });
    }

    if (req.body.menuGroup) {
      const existingGroup = await MenuGroup.findById(req.body.menuGroup);
      if (!existingGroup) {
        return res.status(404).json({ error: 'El grupo de menús referenciado no existe.' });
      }
    }

    Object.assign(menu, req.body);
    const updatedMenu = await menu.save();
    res.status(200).json(updatedMenu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado.' });
    }

    await menu.deleteOne();
    res.status(200).json({ message: 'Menú eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
