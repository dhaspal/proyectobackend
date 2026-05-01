const APPOINTMENT_STATUS = {
  REQUESTED: "REQUESTED", // creado por cliente, esperando taller
  ACCEPTED: "ACCEPTED", // aceptado por taller y agendado
  REJECTED: "REJECTED", // rechazado por taller
  RESCHEDULE_PROPOSED: "RESCHEDULE_PROPOSED", // taller propone nueva fecha, esperando confirmación cliente
  CONFIRMED: "CONFIRMED", // cliente confirma propuesta; se agenda
  CANCELLED: "CANCELLED", // cancelado (cliente o taller)
  COMPLETED: "COMPLETED", // completado
  INCOMPLETE: "INCOMPLETE", // incompleto / no realizado
};

const APPOINTMENT_HISTORY_BUCKET = {
  PENDING: "PENDING",
  COMPLETE: "COMPLETE",
  INCOMPLETE: "INCOMPLETE",
};

module.exports = { APPOINTMENT_STATUS, APPOINTMENT_HISTORY_BUCKET };

