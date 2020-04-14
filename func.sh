#!/usr/bin/env bash

if npm run test:func:only | tee /dev/stderr | grep '0 scenarios'; then
    npm run test:func:all
fi
