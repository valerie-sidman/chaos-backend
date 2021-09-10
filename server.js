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

const messagesPerPage = 10;

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
      file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAPSSURBVFiFtddriFZlEAfwn5eWvLRpWZaX2my1QHMzNdIsA8uKaDUkIiuLCMqIiIroAl3oYkFBUNaHDQ2MLh8CDfsSRNuHMuweqW1Whq5dLN211LDC7cPMW8fXs5dcd+DlnPc8c2b+zzMz/5lD76UR7+EP7MArmHII7PZIrsfPWIjROAOP43fc0tfOR6ItnS7Cl3gLF+F8/NjXAG7AKkwUO56Pm7EVu9HUEyP9egFgSV434RLMy/81OAlfo6M7I/17AWA7RuR1SOH5n2jpifPeAtiECQmgrhd2/pfU4zG8i9/ELjuwD2tEBUzsC8fH4XWx2+Ui3qeIox+M8SIPmvALVuPEQ+V8FrZhKY7qgX4tnkogFx6Mw7vxBVbgGvyKqw/CzmVox3VYhs9FiLqUo7FXHOe9+EGUU32V3mEYgxmYibH5rChj8Zk4iUcEOe0WJdqpnI7vC/+H4EmRcPeIE1kleH+PKLcNaXgv3hT0fKvYfROGF+x9gjldARinnEKniMx/P42PKdEZiZtSby3OKdFZh+ldATgSf+PwrpQOUvphp25CQISgL9ppXQLYj/zKmPAjnN0HAGam7X3dAWjG3D4AcEHa3k/KALRjVNWzetFuu0wgkfGNItMHVa2NFiEolcGYjclisLiysHapKLM1ghGXd2KjAT/hU2xMO0W5WORXQ/o6org4FR+ngw5BIA+IdgsD81qL75TnyGrcUfhfeWeYYNcP0/b2BHlu2S4eFRTciNdEOBqrdOoxFANESY1LZ5MLTisyR1D5SiwQ/eTZMscVWSWIhuCCSTi5RG8g1ifANnEqg0v0ThDsWsmHRUoSsSLTxJDRmqg7dN6EarAFi3GV4Puhneg2itLbgc2CaQ8I4VlivG7BM6LXl+2oKA1iAN0marwrGSRCt0ScVquYng1IhVbRdP4SHa5FzAG1YqfF+W6aaDybcn2jaDq1YkRvLej2TzvniZDOFsm6AN+UIV2Yzr5Kxc2iOiYVdFbi2rx/WJwYMSU1F/TGiy+mraJLrkvbi8scE6W4K0FUZADuSiPH5rP7RVe8PHe/BVfgbXGKROl9i4fsPyfME98QZZ3Sy3gw70dVXVfgibyvyftm3CZa8Dt42n95cx/eqLJxvOiIt4sTOUDWJsIJIr41ItY1+dJLZS91IkvF7gn6HSHIbbrIh5aKYpE4XsxdLBOj2Znp/E7BcLvwvJhq1qfhdhHXYWKWOFUk4lwRsp1pY6oYWOaJ0P1L59WfZvNxI04TjWW76AHPiYyeIUq2Lp0OTxttCWYzPsjfHpFws3BMrm/AC3i14vAfnWniWJKwgfMAAAAASUVORK5CYII=',
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
  const pageQuantity = Math.ceil(messages.length / messagesPerPage);

  if ((pageQuantity <= 1 && page == 1) || !page) {
    return response(ctx, messages);
  } else if (pageQuantity <= 1 && page > 1) {
    return response(ctx, []);
  }
  if (page == 1) {
    return response(ctx, messages.slice(-10));
  }
  if (page == pageQuantity) {
    return response(ctx, messages.slice(0, messagesPerPage * (page - 1) * -1));
  }

  return response(ctx, messages.slice(messagesPerPage * page * -1, messagesPerPage * (page - 1) * -1));
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