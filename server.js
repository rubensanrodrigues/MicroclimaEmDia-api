import http from "http";
import dotenv from "dotenv";
import sensorHandler from "./api/sensor.js";
import configHandler from "./api/config.js";

dotenv.config();

const server = http.createServer(async (req, res) => {
    let body = "";

    // Recebe o corpo da requisição
    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", async () => {
        try {
            // Converte o JSON recebido
            req.body = body ? JSON.parse(body) : {};
        } catch {
            req.body = {};
        }

        // Adiciona status() para compatibilidade com os handlers
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };

        // Adiciona json() para facilitar as respostas
        res.json = (data) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
        };

        // Analisa a URL
        const url = new URL(req.url, `http://${req.headers.host}`);

        const pathname = url.pathname;

        // Parâmetros da rota
        req.params = {};

        let route = null;

        // --------------------------------------------------
        // GET /api/sensor
        // --------------------------------------------------
        if (pathname === "/api/sensor") {
            route = sensorHandler;
        }

        // --------------------------------------------------
        // GET /api/config/:sensorid
        // Exemplo:
        // /api/config/ESP32-001
        // --------------------------------------------------
        else if (pathname.startsWith("/api/config/")) {
            const parts = pathname.split("/");

            // Esperamos:
            // ["", "api", "config", "ESP32-001"]

            if (parts.length === 4 && parts[3]) {
                req.params.sensorid = parts[3];

                route = configHandler;
            }
        }

        // --------------------------------------------------
        // Rota não encontrada
        // --------------------------------------------------
        if (!route) {
            return res.status(404).json({
                error: "Not found"
            });
        }

        // Executa o handler da rota
        try {
            await route(req, res);
        } catch (error) {
            console.error("Erro no handler:", error);

            if (!res.writableEnded) {
                res.status(500).json({
                    error: "Erro interno do servidor"
                });
            }
        }
    });
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Servidor rodando em http://0.0.0.0:3000");
});
