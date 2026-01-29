/**
 * Construye una URL pública absoluta para recursos estáticos
 * @param {object} req - Express request
 * @param {string|null} path - Ruta relativa almacenada en BD
 */
const buildPublicUrl = (req, path) => {
  if (!path) return null;

  const protocol = req.protocol;
  const host = req.get('host');

  return `${protocol}://${host}${path}`;
};

module.exports = { buildPublicUrl };
