const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const cors = require('koa2-cors');
const fs = require('fs');
const http = require('http');

const books = JSON.parse(fs.readFileSync('./data/books.json'));
const games = JSON.parse(fs.readFileSync('./data/games.json'));
const recipes = JSON.parse(fs.readFileSync('./data/recipes.json'));
const series = JSON.parse(fs.readFileSync('./data/series.json'));
const weather = JSON.parse(fs.readFileSync('./data/weather.json'));

const messages = [
  {
    id: 1,
    type: 'user',
    body: {
      text: '@book',
      geolocation: {}
    },
    date: 1626684557204
  },
  {
    id: 2,
    type: 'bot',
    body: {
      id: 1,
      type: 'book',
      title: 'Мастер и Маргарита',
      author: 'Михаил Булгаков',
      genre: 'роман'
    },
    date: 1626684640073
  },
  {
    id: 3,
    type: 'user',
    body: {
      text: '@weather',
      geolocation: {}
    },
    date: 1626684641672
  },
  {
    id: 4,
    type: 'bot',
    body: {
      id: 4,
      type: 'forecast',
      temperature: '+10',
      description: 'Дождь'
    },
    date: 1626684643015
  },
  {
    id: 5,
    type: 'user',
    body: {
      text: 'Привет, вот тебе картинка!',
      file: 'здесь будет картинка',
      fileName: 'картинка.png',
      geolocation: {}
    },
    date: 1626684644208
  },
  {
    id: 6,
    type: 'user',
    body: {
      text: 'Адрес музея изобразительных искусств имени А.С. Пушкина: ул. Волхонка, 12',
      geolocation: {}
    },
    date: 1626684645626
  },
];


const response = (ctx, body = null, status = 200) => {
  return new Promise((resolve, reject) => {
    ctx.response.status = status;
    ctx.response.body = body;
    resolve();
  })
}

const randomNumber = (start, stop) => {
  return Math.floor(Math.random() * (stop - start + 1)) + start;
}

const app = new Koa();
app.use(cors({
  origin: '*',
}));
app.use(koaBody({
  json: true
}));

const router = new Router();

// загрузка сообщений

router.get('/api/messages', async (ctx, next) => {
  const { page } = ctx.request.query;
  const reversePage = Math.ceil(messages.length / 10) - page + 1;
  const offset = (reversePage * 10) - 10;
  return response(ctx, messages.slice(offset, offset + 10));
});

// добавление сообщения

router.post('/api/messages/new', async (ctx, next) => {
  const { text, file, fileName, latitude, longitude } = ctx.request.body;

  messages.push(
    {
      id: messages.length + 1,
      type: 'user',
      body: {
        text: text,
        file: file,
        fileName: fileName,
        geolocation: {
          latitude: latitude,
          longitude: longitude
        }
      },
      date: new Date().getTime(),
    }
  );

// команды для бота

  if (text.startsWith('@')) {
    let finded;

    const randomId = randomNumber(1, 5);
    switch (text) {
      case '@book':
        finded = books.find(book => book.id === randomId);
        break;
      case '@game':
        finded = games.find(game => game.id === randomId);
        break;
      case '@recipe':
        finded = recipes.find(recipe => recipe.id === randomId);
        break;
      case '@series':
        finded = series.find(serie => serie.id === randomId);
        break;
      case '@weather':
        finded = weather.find(forecast => forecast.id === randomId);
        break;
    }

    if (finded) {
      messages.push(
        {
          id: messages.length + 1,
          type: 'bot',
          body: finded,
          date: new Date().getTime(),
        }
      );
    }
  }

  return response(ctx, messages[messages.length - 1]);
});

// удаление сообщения

router.delete('/api/messages/delete', async (ctx, next) => {
  const { id } = ctx.request.query;
  const findedMessageIndex = messages.findIndex(message => message.id === Number(id));

  messages.splice(findedMessageIndex, 1);

  return response(ctx, messages);
});

// поиск по сообщениям

router.get('/api/messages/find', async (ctx, next) => {
  const { query } = ctx.request.query;
  query === undefined ? '' : query.trim().toLowerCase();

  const filtered = messages.filter(message =>
    Object.entries(message.body)
      .filter(([key, value]) => key !== 'id' && key !== 'type' && key !== 'geolocation' && key !== 'file')
      .filter(([key, value]) => {
        console.log("all", key, value);
        if (value.toLowerCase().includes(query)) {
          console.log("filtered", key, value);
        }
        return value.toLowerCase().includes(query);
      }).length > 0
  );
  return response(ctx, filtered);
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 7071;
const server = http.createServer(app.callback());
server.listen(port);