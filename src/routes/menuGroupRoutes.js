import express from 'express';
import { createMenuGroup, getMenuGroups, updateMenuGroup, deleteMenuGroup } from '../controllers/menuGroupController.js';

const router = express.Router();

router.post('/', createMenuGroup);
router.get('/', getMenuGroups);
router.put('/:id', updateMenuGroup);
router.delete('/:id', deleteMenuGroup);

export default router;
