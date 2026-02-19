import { Request, Response } from 'express';
import { validationResult } from 'express-validator'; 
import { HistorialM } from '../models/HistorialM';
import { Pet } from '../models/Pet'; 

/// CREAR REGISTRO (Solo Veterinarios)
export const createEntry = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ELIMINADO: const reqAny = req as any;
    const { petId, descripcion, diagnostico, tratamiento } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const newEntry = new HistorialM({
      mascota: petId,
      veterinario: req.user!.id, // <-- Usar req.user! directamente
      descripcion,
      diagnostico,
      tratamiento
    });

    await newEntry.save();
    return res.status(201).json(newEntry);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear historial' });
  }
};

// VER HISTORIAL DE UNA MASCOTA
export const getHistoryByPet = async (req: Request, res: Response) => {
  try {
    const { petId } = req.params;
    // ELIMINADO: const reqAny = req as any;

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    // <-- Usar req.user! directamente
    if (req.user!.role === 'duenio' && pet.duenioId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'No tenés permiso para ver este historial' });
    }

    const history = await HistorialM.find({ mascota: petId })
      .populate('veterinario', 'username email') 
      .sort({ fecha: -1 });

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener historial' });
  }
};