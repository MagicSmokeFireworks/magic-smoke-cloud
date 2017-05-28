#! /usr/bin/python

import json

with open('boardinfo.json') as boardinfo_json:
    boardinfo = json.load(boardinfo_json)

telemetry = {}
predictions = {}

for board_sname in boardinfo:
    telemetry[board_sname] = {}
    telemetry[board_sname]['firmver'] = 'no data'
    telemetry[board_sname]['ip'] = ''
    telemetry[board_sname]['swarm'] = 'no data'
    telemetry[board_sname]['hwarm'] = 'no data'
    telemetry[board_sname]['rssi'] = 'no data'
    telemetry[board_sname]['cmdcount'] = 'no data'
    telemetry[board_sname]['firecount'] = ['no data']*8
    telemetry[board_sname]['res'] = ['no data']*8

    predictions[board_sname] = {}
    predictions[board_sname]['swarm'] = '0'
    predictions[board_sname]['cmdcount'] = '0'
    predictions[board_sname]['firecount'] = ['0']*8
    predictions[board_sname]['res'] = ['none']*8

with open('telemetry.json', 'w') as telemetry_json:
    json.dump(telemetry, telemetry_json, indent=4)

with open('predictions.json', 'w') as predictions_json:
    json.dump(predictions, predictions_json, indent=4)

