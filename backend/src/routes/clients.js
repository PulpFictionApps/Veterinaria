import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ===========================
// CLIENTS (TUTORS) MANAGEMENT  
// ===========================

// POST /clients - Create new client/tutor
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, rut, address } = req.body;
    const client = await prisma.tutor.create({
      data: { 
        name, 
        email: email || null, 
        phone: phone || null, 
        rut: rut || null, 
        address: address || null, 
        userId: req.user.id 
      },
    });
    res.json(client);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /clients - List all clients with their pets
router.get("/", verifyToken, async (req, res) => {
  try {
    const clients = await prisma.tutor.findMany({
      where: { userId: req.user.id },
      include: {
        pets: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /clients/:id - Get specific client with pets
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const clientId = Number(req.params.id);
    const client = await prisma.tutor.findFirst({
      where: { 
        id: clientId,
        userId: req.user.id 
      },
      include: {
        pets: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /clients/:id - Update client
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const clientId = Number(req.params.id);
    const { name, email, phone, rut, address } = req.body;
    
    const updatedClient = await prisma.tutor.updateMany({
      where: { 
        id: clientId,
        userId: req.user.id 
      },
      data: { 
        name: name || undefined, 
        email: email !== undefined ? email : undefined, 
        phone: phone !== undefined ? phone : undefined, 
        rut: rut !== undefined ? rut : undefined, 
        address: address !== undefined ? address : undefined
      }
    });
    
    if (updatedClient.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Fetch updated client
    const client = await prisma.tutor.findFirst({
      where: { 
        id: clientId,
        userId: req.user.id 
      },
      include: {
        pets: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    res.json(client);
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// DELETE /clients/:id - Delete client
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const clientId = Number(req.params.id);
    
    // Check if client has pets
    const petsCount = await prisma.pet.count({
      where: { tutorId: clientId }
    });
    
    if (petsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with pets. Delete pets first.' 
      });
    }
    
    const deleted = await prisma.tutor.deleteMany({
      where: { 
        id: clientId,
        userId: req.user.id 
      }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ===========================
// PETS MANAGEMENT
// ===========================

// POST /clients/:clientId/pets - Create new pet for client
router.post("/:clientId/pets", verifyToken, async (req, res) => {
  try {
    const tutorId = Number(req.params.clientId);
    const { name, type, breed, age, weight, sex, birthDate } = req.body;

    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });

    // Verify tutor exists and belongs to user
    const tutor = await prisma.tutor.findFirst({ 
      where: { 
        id: tutorId,
        userId: req.user.id 
      } 
    });
    if (!tutor) return res.status(404).json({ error: 'Client not found' });

    const now = new Date();
    const pet = await prisma.pet.create({
      data: {
        name,
        type,
        breed: breed || null,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
        sex: sex || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        tutorId,
        updatedAt: now
      },
      include: {
        tutor: true
      }
    });
    
    res.json(pet);
  } catch (err) {
    console.error('Error creating pet:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /clients/:clientId/pets - Get all pets for specific client
router.get("/:clientId/pets", verifyToken, async (req, res) => {
  try {
    const tutorId = Number(req.params.clientId);
    
    // Verify tutor exists and belongs to user
    const tutor = await prisma.tutor.findFirst({ 
      where: { 
        id: tutorId,
        userId: req.user.id 
      } 
    });
    if (!tutor) return res.status(404).json({ error: 'Client not found' });
    
    const pets = await prisma.pet.findMany({
      where: { tutorId },
      include: {
        tutor: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(pets);
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /clients/:clientId/pets/:petId - Get specific pet
router.get("/:clientId/pets/:petId", verifyToken, async (req, res) => {
  try {
    const tutorId = Number(req.params.clientId);
    const petId = Number(req.params.petId);
    
    const pet = await prisma.pet.findFirst({
      where: { 
        id: petId,
        tutorId,
        tutor: {
          userId: req.user.id
        }
      },
      include: {
        tutor: true
      }
    });
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    res.json(pet);
  } catch (err) {
    console.error('Error fetching pet:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /clients/:clientId/pets/:petId - Update pet
router.patch("/:clientId/pets/:petId", verifyToken, async (req, res) => {
  try {
    const tutorId = Number(req.params.clientId);
    const petId = Number(req.params.petId);
    const { name, type, breed, age, weight, sex, birthDate } = req.body;
    
    // Verify pet exists and belongs to user's client
    const existingPet = await prisma.pet.findFirst({
      where: { 
        id: petId,
        tutorId,
        tutor: {
          userId: req.user.id
        }
      }
    });
    
    if (!existingPet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name: name || undefined,
        type: type || undefined,
        breed: breed !== undefined ? breed : undefined,
        age: age !== undefined ? Number(age) : undefined,
        weight: weight !== undefined ? Number(weight) : undefined,
        sex: sex !== undefined ? sex : undefined,
        birthDate: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : undefined,
        updatedAt: new Date()
      },
      include: {
        tutor: true
      }
    });
    
    res.json(updatedPet);
  } catch (err) {
    console.error('Error updating pet:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// DELETE /clients/:clientId/pets/:petId - Delete pet
router.delete("/:clientId/pets/:petId", verifyToken, async (req, res) => {
  try {
    const tutorId = Number(req.params.clientId);
    const petId = Number(req.params.petId);
    
    // Verify pet exists and belongs to user's client
    const existingPet = await prisma.pet.findFirst({
      where: { 
        id: petId,
        tutorId,
        tutor: {
          userId: req.user.id
        }
      }
    });
    
    if (!existingPet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    await prisma.pet.delete({
      where: { id: petId }
    });
    
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    console.error('Error deleting pet:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ===========================
// BACKWARD COMPATIBILITY ROUTES
// ===========================

// Legacy pets routes for compatibility (redirect to new structure)
// GET /clients/pets?tutorId=X - Get pets by tutorId (legacy support)
router.get("/pets", verifyToken, async (req, res) => {
  try {
    const tutorId = req.query.tutorId;
    if (!tutorId) {
      return res.status(400).json({ error: 'tutorId query parameter required' });
    }
    
    return req.url = `/${tutorId}/pets`, router.handle(req, res);
  } catch (err) {
    console.error('Error in legacy pets route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;