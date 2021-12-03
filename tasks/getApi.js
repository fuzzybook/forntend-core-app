#!/usr/bin/env node
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
const fetch = require('node-fetch');
fs = require('fs');

fetch('http://localhost:8088/ts')
  .then((res) => res.json())
  .then((data) => {
    if (data.ok) {
      fs.writeFile(
        './src/generatedApi/api.ts',
        '//// ' + data.data,
        function (err, data) {
          if (err) {
            return console.error('\x1b[31mERROR ', err, '\x1b[0m');
          }
          console.info(
            '\x1b[32m File: ',
            './src/generatedApi/api.ts saved successfully! \x1b[0m'
          );
          process.exit();
        }
      );
    } else {
      console.error('\x1b[31m ERROR ', data.data, '\x1b[0m');
      process.exit();
    }
  });
