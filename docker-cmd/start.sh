#!/bin/bash

docker run --rm -d --name forus-frontend -p 2000:80 -p 3000:3000 -p 4000:4000 -p 5000:5000 forus-io/forus-frontend