const { buildPublicUrl } = require('./public-url');

const serializePublicacion = (req, publicacion) => {
  if (!publicacion) return null;

  const data = publicacion.toJSON();

  data.imagen_url = buildPublicUrl(req, data.imagen_url);

  return data;
};

const serializePublicaciones = (req, publicaciones) =>
  publicaciones.map(p => serializePublicacion(req, p));

module.exports = {
  serializePublicacion,
  serializePublicaciones
};
