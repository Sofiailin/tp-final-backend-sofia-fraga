import { Request, Response } from 'express';
import { Pet } from '../models/Pet';
import { UserRole } from '../types/auth';

// --- VER MASCOTAS ---
export const getPets = async (req: Request, res: Response) => {
  try {
    let query = {}; // Por defecto (Admin), busca todas
    
    // Si es Dueño: Solo ve mascotas donde su ID coincida con el del dueño
    if (req.user!.role === UserRole.DUENIO) {
      query = { duenioId: req.user!.id };
    } 
    // Si es Veterinario: Solo ve mascotas que él registró
    else if (req.user!.role === UserRole.VETERINARIO) {
      query = { veterinarioId: req.user!.id };
    }

    const pets = await Pet.find(query);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mascotas' });
  }
};

// --- CREAR MASCOTA --- (Dueños ya están bloqueados en la ruta)
export const createPet = async (req: Request, res: Response) => {
  try {
    const petData = { ...req.body };
    
    // Si es Veterinario, guardamos su ID como el creador de la mascota
    if (req.user!.role === UserRole.VETERINARIO) {
      petData.veterinarioId = req.user!.id;
    }

    const newPet = new Pet(petData);
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la mascota' });
  }
};

// --- ACTUALIZAR MASCOTA --- (Dueños bloqueados en la ruta)
export const updatePet = async (req: Request, res: Response) => {
  try {
    const query: any = { _id: req.params.id };
    
    // Si es veterinario, limitamos la búsqueda a las que él creó
    if (req.user!.role === UserRole.VETERINARIO) {
        query.veterinarioId = req.user!.id;
    }

    const updated = await Pet.findOneAndUpdate(query, req.body, { new: true });
    
    if (!updated) {
        return res.status(403).json({ mensaje: 'No autorizado a modificar esta mascota o no existe' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar' });
  }
};

// --- ELIMINAR MASCOTA --- (Dueños bloqueados en la ruta)
export const deletePet = async (req: Request, res: Response) => {
  try {
    const query: any = { _id: req.params.id };
    
    // Si es veterinario, limitamos el borrado a las que él creó
    if (req.user!.role === UserRole.VETERINARIO) {
        query.veterinarioId = req.user!.id;
    }

    const deleted = await Pet.findOneAndDelete(query);
    
    if (!deleted) {
        return res.status(403).json({ mensaje: 'No autorizado a eliminar esta mascota o no existe' });
    }
    
    res.json({ mensaje: 'Mascota eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar' });
  }
};