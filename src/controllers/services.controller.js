const mongoose = require("mongoose");
const { Service } = require("../models/Service");
const { asyncHandler } = require("../utils/asyncHandler");
const { createServiceSchema, updateServiceSchema } = require("../validators/services.validators");

const listServices = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.active === "true") q.isActive = true;
  if (req.query.active === "false") q.isActive = false;
  if (req.query.category) q.category = String(req.query.category);
  const services = await Service.find(q).sort({ name: 1 }).limit(500);
  return res.json({ services });
});

const getService = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const service = await Service.findById(id);
  if (!service) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  return res.json({ service });
});

const createService = asyncHandler(async (req, res) => {
  const input = createServiceSchema.parse(req.body);
  const service = await Service.create(input);
  return res.status(201).json({ service });
});

const updateService = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const service = await Service.findById(id);
  if (!service) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  const input = updateServiceSchema.parse(req.body);
  Object.assign(service, input);
  await service.save();
  return res.json({ service });
});

const deleteService = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const service = await Service.findById(id);
  if (!service) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  await service.deleteOne();
  return res.status(204).send();
});

module.exports = { listServices, getService, createService, updateService, deleteService };

