import pool from "../lib/db.js";

export default async function handler(req, res) {

    // Métodos permitidos
    const allowedMethods = ["GET"];
    if (!allowedMethods.includes(req.method)) {
        console.log("Metodo nao permitido:", req.method);
        return res.status(405).json({ error: "Método não permitido" });
    }

    // Autenticação
    const auth = req.headers["x-api-key"];
    if (!auth || auth !== process.env.API_KEY) {
        return res.status(401).json({ error: "Não autorizado" });
    }

    // Gerencia de metodos
    switch (req.method) {
        case "GET":
            return handleGetConfig(req, res);
    }
}

// Gerencia GET
async function handleGetConfig(req, res) {

    const sensorid = req.params.sensorid;

    console.log(
        "GET /api/config/:sensorid - sensorid:",
        sensorid
    );

    try {
        const result = await pool.query(
            `
            SELECT
                id,
                liga_hora,
                liga_minuto,
                desliga_hora,
                desliga_minuto,

                EXTRACT(
                    YEAR FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
                )::INTEGER AS ano,

                EXTRACT(
                    MONTH FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
                )::INTEGER AS mes,

                EXTRACT(
                    DAY FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
                )::INTEGER AS dia,

                EXTRACT(
                    HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
                )::INTEGER AS hora,

                EXTRACT(
                    MINUTE FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
                )::INTEGER AS minuto,

                EXTRACT(
                    SECOND FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
                )::INTEGER AS segundo

            FROM pi6.iluminacao

            WHERE id = $1
            `,
            [sensorid]
        );

        // Sensor não encontrado
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Configuração não encontrada"
            });
        }

        const config = result.rows[0];

        return res.status(200).json({

            status: "OK",

            rele: {
                liga_hora: config.liga_hora,
                liga_minuto: config.liga_minuto,

                desliga_hora: config.desliga_hora,
                desliga_minuto: config.desliga_minuto
            },

            horatual: {
                ano: config.ano,
                mes: config.mes,
                dia: config.dia,
                hora: config.hora,
                minuto: config.minuto,
                segundo: config.segundo
            }

        });

    } catch (error) {

        console.error(
            "Erro ao consultar configuração:",
            error
        );

        return res.status(500).json({
            error: "Erro interno do servidor"
        });
    }
}