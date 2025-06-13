const { Usuario } = require('../../models/usuario');
exports.getAll = async (req, res, next) => {
  try {
    const users = await Usuario.findAll({ attributes: ['id','username'] });
    res.json(users);
  } catch (err) { next(err) }
};
