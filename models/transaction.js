"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        as: "booking",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Transaction.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(15, 2), // Menyimpan nominal transaksi
        allowNull: false,
      },
      paymentProof: {
        type: DataTypes.STRING, // Menyimpan URL atau path bukti pembayaran
        allowNull: true,
        defaultValue: null,
      },
      isPaid: {
        type: DataTypes.BOOLEAN, // Menandai apakah transaksi sudah dibayar
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
