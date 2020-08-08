#!/usr/bin/env bash

set -ex

npx tsc --build ./tsconfig.json

npx eslint -c ./.eslintrc.json --ext .ts ./

npx prettier --write ./main.ts ./main.js
