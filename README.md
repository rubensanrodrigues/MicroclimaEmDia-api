# Microclima em Dia API

API para ingestão de dados de sensores ambientais utilizada no projeto "Microclima em Dia".

Esta API recebe leituras enviadas por sensores e armazena os dados em um banco PostgreSQL para posterior análise e visualização.

---

# Sobre o projeto

O "Microclima em Dia" é uma plataforma de aquisição e observação ambiental em laboratório, desenvolvida para coletar dados como:

- temperatura
- umidade
- luminosidade

Os dados são enviados por sensores e armazenados para análise, monitoramento e visualização.

Este repositório contém o serviço responsável pela ingestão desses dados via API HTTP.

---

# Funcionamento da API

A API expõe o endpoint:

```
/api/sensor
```

### Autenticação

As requisições devem incluir o header:

```
x-api-key: SUA_API_KEY
```

---

# Endpoint

## POST /api/sensor

Envia leituras de um sensor para armazenamento.

### Exemplo de requisição

```json
{
  "sensor_id": "sensor_lab_01",
  "leituras": [
    {
      "temperatura": 22.5,
      "umidade": 60.2,
      "luminosidade": 300
    },
    {
      "temperatura": 22.7,
      "umidade": 59.8,
      "luminosidade": 310
    }
  ]
}
```

### Resposta

```json
{
  "success": true,
  "registros": 2
}
```

---

## GET /api/sensor

Endpoint simples para verificação de funcionamento da API.

### Resposta

```json
{
  "status": "OK"
}
```

## GET /api/config/:sensorid

Retorna os horários de acionamento e desligamento do relé configurado para o
sensor indicado na rota, além da data e hora atuais do banco de dados no fuso
de Brasília (GMT-3).

### Parâmetros da rota

- `sensorid`: identificador do sensor cuja configuração será consultada.

### Exemplo de requisição

```http
GET /api/config/sensor_lab_01
x-api-key: SUA_API_KEY
```

### Resposta

```json
{
  "status": "OK",
  "rele": {
    "liga_hora": 8,
    "liga_minuto": 0,
    "desliga_hora": 18,
    "desliga_minuto": 30
  },
  "horatual": {
    "ano": 2026,
    "mes": 10,
    "dia": 7,
    "hora": 23,
    "minuto": 43,
    "segundo": 0
  }
}
```

Os valores de `horatual` são retornados separadamente: `ano`, `mes`, `dia`,
`hora`, `minuto` e `segundo`.

### Respostas de erro

- `401`: chave de API ausente ou inválida.
- `404`: configuração não encontrada para o `sensorid` informado.
- `405`: método HTTP não permitido (este endpoint aceita apenas `GET`).
- `500`: erro interno ao consultar o banco de dados.

---

# Banco de dados

Os dados são armazenados em uma tabela PostgreSQL:

```
pi6.sensor_data
```

Campos utilizados:

- sensor_id
- temperatura
- umidade
- luminosidade

---

# Requisitos

Para executar o projeto são necessários:

- Node.js
- PostgreSQL
- biblioteca Node "pg"
- "dotenv" (apenas para desenvolvimento)

Dependências principais:

```
pg
dotenv
```

---

# Variáveis de ambiente

Crie um arquivo ".env" durante o desenvolvimento:

```
DATABASE_URL=postgres://usuario:senha@host:porta/database
API_KEY=sua_chave_de_api
```

---

# Executando localmente

Instalar dependências:

```bash
npm install
```

Executar em modo desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em:

```
http://localhost:3000
```

---

# Deploy

A versão de produção é preparada para Vercel.

Para deploy:

- utilize a branch específica de "release para Vercel"
- configure as variáveis de ambiente na plataforma

---

# Estrutura do projeto

```
.
├── api
│   ├── config.js
│   └── sensor.js
├── server.js
├── package.json
└── README.md
```

`server.js` é utilizado apenas para execução local e não faz parte do deploy
da API na Vercel.

`api/sensor.js`

Handler responsável por:

- autenticação via API key
- validação das leituras
- inserção no PostgreSQL

`api/config.js`

Handler responsável por consultar os horários do relé e a data e hora atuais
do banco de dados para um sensor.

---

# Licença

Este projeto foi criado para fins educacionais.

O uso, modificação e redistribuição são permitidos livremente **desde que a autoria original seja mantida**.

Remover ou ocultar a autoria original é expressamente proibido. Caso a autoria seja removida, **você não tem permissão para usar este código em nenhuma forma**.