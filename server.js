const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 5000;

router.render = (req, res) => {
    const data = res.locals.data;
  
    if (!req.originalUrl.includes("items")) {
      res.json({
        meta: {
          totalCount: data.length,
        },
        results: data,
      });
      return;
    }
  
    const brands = {};
    const allTags = {};
    const items = {};
  
    for (let i = 0; i < data.length; i++) {
      if (brands[data[i].manufacturer]) {
        brands[data[i].manufacturer] += 1;
      } else {
        brands[data[i].manufacturer] = 1;
      }
  
      if (items[data[i].itemType]) {
        items[data[i].itemType] += 1;
      } else {
        items[data[i].itemType] = 1;
      }
  
      for (let j = 0; j < data[i].tags.length; j++) {
        if (allTags[data[i].tags[j]]) {
          allTags[data[i].tags[j]] += 1;
        } else {
          allTags[data[i].tags[j]] = 1;
        }
      }
    }
  
    const companies = [
      { name: "All", count: data.length },
      ...Object.entries(brands).map((item) => ({
        name: item[0],
        count: item[1],
      })),
    ];
  
    const tags = [
      { name: "All", count: data.length },
      ...Object.entries(allTags).map((item) => ({
        name: item[0],
        count: item[1],
      })),
    ];
  
    const types = [
      { name: "All", count: data.length },
      ...Object.entries(items).map((item) => ({
        name: item[0],
        count: item[1],
      })),
    ];
  
    let page = 1;
    const perPage = 16;
    if (req.originalUrl.indexOf("page") > -1) {
      const comingURL = url.parse(req.url, true);
      page = comingURL.query.page;
    }
  
    const index = (page - 1) * perPage;
    const dataItems =
      data.length < 16 ? data : data.slice(index, index + perPage);
  
    if (req.originalUrl.includes("filters")) {
      return res.json({
        data: {
          companies,
          types,
          tags,
        },
      });
    }
  
    res.json({
      meta: {
        total: res.locals.data.length,
        currentPage: page,
      },
      data: {
        dataItems,
      },
    });
  };

server.use(middlewares);
server.use(router);

server.listen(port);