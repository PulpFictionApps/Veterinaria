import express from "express";
import { verifyToken } from "../middleware/auth.js";
import prisma from "../../lib/prisma.js";

const router = express.Router();

// GET /consultation-types - List all consultation types for the authenticated professional
router.get('/', verifyToken, async (req, res) => {
  try {
    const types = await prisma.consultationType.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' }
    });
    
    // Convert price from cents back to pesos
    const typesWithCorrectPrice = types.map(type => ({
      ...type,
      price: Math.round(type.price / 100)
    }));
    
    res.json(typesWithCorrectPrice);
  } catch (err) {
    console.error('Error fetching consultation types:', err);
    res.status(500).json({ error: 'Error fetching consultation types' });
  }
});

// POST /consultation-types - Create a new consultation type
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, price, description, active = true } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const priceInCents = Math.round(Number(price) * 100); // Convert to cents
    
    const type = await prisma.consultationType.create({
      data: {
        name,
        price: priceInCents,
        description,
        active,
        userId: req.user.id
      }
    });
    
    // Convert price back to pesos for response
    const responseData = {
      ...type,
      price: Math.round(type.price / 100)
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('Error creating consultation type:', err);
    res.status(500).json({ error: 'Error creating consultation type' });
  }
});

// PUT /consultation-types/:id - Update a consultation type
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, active } = req.body;
    
    // Verify ownership
    const existing = await prisma.consultationType.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Consultation type not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Math.round(Number(price) * 100);
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    
    const updated = await prisma.consultationType.update({
      where: { id: Number(id) },
      data: updateData
    });
    
    // Convert price back to pesos for response
    const responseData = {
      ...updated,
      price: Math.round(updated.price / 100)
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('Error updating consultation type:', err);
    res.status(500).json({ error: 'Error updating consultation type' });
  }
});

// PATCH /consultation-types/:id - Partially update a consultation type
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, active, duration, color } = req.body;
    
    console.log('📝 PATCH consultation type:', id);
    console.log('📥 Datos recibidos:', { name, price, description, active, duration, color });
    
    // Verify ownership
    const existing = await prisma.consultationType.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Consultation type not found' });
    }

    console.log('📋 Datos existentes:', existing);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Math.round(Number(price) * 100); // Convert to cents
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (duration !== undefined) updateData.duration = Number(duration);
    if (color !== undefined) updateData.color = color;
    
    console.log('🔄 Datos a actualizar:', updateData);
    
    try {
      const updated = await prisma.consultationType.update({
        where: { id: Number(id) },
        data: updateData
      });
      
      console.log('✅ Datos actualizados en BD:', updated);
      
      // Convert price back to pesos for response
      const responseData = {
        ...updated,
        price: Math.round(updated.price / 100)
      };
      
      console.log('📤 Respuesta enviada:', responseData);
      
      res.json(responseData);
    } catch (updateError) {
      console.error('❌ Error específico en update de Prisma:', updateError);
      console.error('❌ Error message:', updateError.message);
      console.error('❌ Error code:', updateError.code);
      throw updateError;
    }
  } catch (err) {
    console.error('❌ Error updating consultation type:', err);
    res.status(500).json({ error: 'Error updating consultation type' });
  }
});

// DELETE /consultation-types/:id - Delete a consultation type
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const existing = await prisma.consultationType.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Consultation type not found' });
    }

    // Check if any appointments are using this type
    const appointmentsCount = await prisma.appointment.count({
      where: { consultationTypeId: Number(id) }
    });

    if (appointmentsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete consultation type that is used in appointments. Consider deactivating it instead.' 
      });
    }
    
    await prisma.consultationType.delete({
      where: { id: Number(id) }
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting consultation type:', err);
    res.status(500).json({ error: 'Error deleting consultation type' });
  }
});

// GET /consultation-types/public/:userId - Get active consultation types for public booking
router.get('/public/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const types = await prisma.consultationType.findMany({
      where: { 
        userId: Number(userId),
        active: true 
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Convert price from cents back to pesos
    const typesWithCorrectPrice = types.map(type => ({
      ...type,
      price: Math.round(type.price / 100)
    }));
    
    res.json(typesWithCorrectPrice);
  } catch (err) {
    console.error('Error fetching public consultation types:', err);
    res.status(500).json({ error: 'Error fetching consultation types' });
  }
});

export default router;