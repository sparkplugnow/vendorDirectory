const express = require('express');
const mongoose = require('mongoose');

exports.index = (req, res) => {
  res.render('index');
};
