const jsonServer = require('json-server');
const url = require("url");
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 5000;

router.render = (req, res) => {
    const data = res.locals.data;
    const isItemsExists = req.originalUrl.includes("items");
    const isFiltersExists = req.originalUrl.includes("filters");
    if (!isItemsExists) {
      res.json({
        meta: {
          totalCount: data.length,
        },
        results: data,
      });
      return;
    }
  
    const allCompanies = {};
    const allTags = {};
    const allTypes = {};
  
    for (let i = 0; i < data.length; i++) {
      if (allCompanies[data[i].manufacturer]) {
        allCompanies[data[i].manufacturer] += 1;
      } else {
        allCompanies[data[i].manufacturer] = 1;
      }
  
      if (allTypes[data[i].itemType]) {
        allTypes[data[i].itemType] += 1;
      } else {
        allTypes[data[i].itemType] = 1;
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
      ...Object.entries(allCompanies).map((item) => ({
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
      ...Object.entries(allTypes).map((item) => ({
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
      if (isFiltersExists) {
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