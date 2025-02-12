import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

import * as mpModule from 'mercadopago';
const mp: any = mpModule;

mp.configure({ access_token: process.env.MP_ACCESS_TOKEN as string });

const app = express();
app.use(bodyParser.json());

app.post('/createPreference', async (req: Request, res: Response) => {
  try {
    const { items, payer } = req.body;

    const preference = {
      items: items || [
        {
          title: 'Servicio Profesional',
          unit_price: 1000,  
          quantity: 1,
        }
      ],
      payer: payer || {
        name: 'Nombre de ejemplo',
        email: 'correo@ejemplo.com',
      },
      back_urls: {
        success: 'https://tu-dominio.com/success',
        failure: 'https://tu-dominio.com/failure',
        pending: 'https://tu-dominio.com/pending',
      },
      auto_return: 'approved',
    };

    const response = await mp.preferences.create(preference);
    const preferenceId = response.body.id;
    res.status(200).json({ preferenceId });
  } catch (error: any) {
    console.error('Error al crear la preferencia:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
