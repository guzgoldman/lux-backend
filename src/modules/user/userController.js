const { Usuario } = require('../../models/usuario');

exports.listar = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({ attributes: ['id','username'] });
    res.json(usuarios);
  } catch (err) {
    next(err); 
  }
};
