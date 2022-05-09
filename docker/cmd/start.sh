#!/bin/bash

docker run --rm -d --name forus-frontend -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 3003:3003 forus-io/forus-frontend