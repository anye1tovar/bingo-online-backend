const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const activeGames = {};

// Endpoint para crear un nuevo juego con valores específicos y tamaño de tarjeta
app.post("/create-game", (req, res) => {
  const { values, cardSize } = req.body;

  if (
    !values ||
    !Array.isArray(values) ||
    values.length < cardSize * cardSize
  ) {
    return res.status(400).json({
      error: "Invalid values. Please provide a sufficient list of values.",
    });
  }

  const gameId = uuidv4();
  activeGames[gameId] = {
    values,
    cardSize, // Guardamos el tamaño de la tarjeta
    cards: [], // Tarjetas asignadas a jugadores
    isActive: true,
  };

  res.json({ gameId });
});

// Endpoint para unirse a un juego y recibir una tarjeta única
app.get("/join-game/:gameId", (req, res) => {
  const { gameId } = req.params;
  const game = activeGames[gameId];

  if (!game || !game.isActive) {
    return res.status(404).json({ error: "Game not found or not active" });
  }
  // Generar una tarjeta de Bingo usando el tamaño de tarjeta específico
  const newCard = generateBingoCard(game.values, game.cardSize);
  game.cards.push(newCard);

  res.json({ card: newCard, cardSize: game.cardSize });
});

// Función para generar una tarjeta de Bingo con un tamaño personalizado
function generateBingoCard(values, cardSize = 5) {
  const totalSlots = cardSize * cardSize;
  const shuffledValues = shuffleArray([...values]);

  const card = [];
  for (let i = 0; i < cardSize; i++) {
    card.push(shuffledValues.slice(i * cardSize, (i + 1) * cardSize));
  }

  // Si el tamaño es 5x5, podemos agregar un espacio "FREE" en el centro
  if (cardSize === 5) {
    card[2][2] = "FREE";
  }

  return card;
}

// Función para mezclar valores
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.listen(4000, () => console.log("Server running on port 4000"));
