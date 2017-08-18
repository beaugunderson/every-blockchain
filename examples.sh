#!/bin/sh

pushd dict/dbfiles
ack -h '"([a-zA-Z0-9:.].*?)"' --output '$1' | sort | uniq > ../../examples.txt
popd
