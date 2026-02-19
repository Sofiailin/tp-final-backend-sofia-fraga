import { Request, Response } from 'express';
import { Pet } from '../models/Pet';
import { User } from '../models/User';
import { UserRole } from '../types/auth';

// --- VER MASCOTAS ---
export const getPets = async (req: Request, res: Response) => {
  try {
    let query = {};

    // Si es Dueño: Solo ve mascotas que le pertenecen
    if (req.user!.role === UserRole.DUENIO) {
      query = { duenioId: req.user!.id };
    }
    // Si es Veterinario: Solo ve mascotas que él registró
    else if (req.user!.role === UserRole.VETERINARIO) {
      query = { veterinarioId: req.user!.id };
    }

    const pets = await Pet.find(query).populate('duenioId', 'username');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener mascotas' });
  }
};

// --- CREAR MASCOTA ---
export const createPet = async (req: Request, res: Response) => {
  try {
    const petData = { ...req.body };

    // Valida a que envíen a quién le pertenece la mascota
    if (!petData.duenioId) {
      return res.status(400).json({ mensaje: 'Error: Es obligatorio enviar el duenioId para asociar la mascota' });
    }

    // Verificamos que el dueño realmente exista en la base de datos
    const duenioExiste = await User.findById(petData.duenioId);
    if (!duenioExiste) {
      return res.status(404).json({ mensaje: 'Error: El dueño ingresado no existe' });
    }

    // Si es Veterinario, guardamos su ID de sesión como el creador
    if (req.user!.role === UserRole.VETERINARIO) {
      petData.veterinarioId = req.user!.id;
    }

    const newPet = new Pet(petData);
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: 'Error al crear la mascota' });
  }
};

// --- ACTUALIZAR MASCOTA ---
export const updatePet = async (req: Request, res: Response) => {
  try {
    const query: any = { _id: req.params.id };

    // Si es veterinario, limitamos a que solo edite las que él creó
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

// --- ELIMINAR MASCOTA ---
export const deletePet = async (req: Request, res: Response) => {
  try {
    const query: any = { _id: req.params.id };

    // Si es veterinario, limitamos a que solo borre las que él creó
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