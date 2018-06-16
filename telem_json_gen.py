#! /usr/bin/python

import json

with open('boardinfo.json') as boardinfo_json:
    boardinfo = json.load(boardinfo_json)

telemetry = {}
predictions = {}
show = {}
show['groups'] = []
show['boards'] = {}

for board_sname in boardinfo:
    telemetry[board_sname] = {}
    telemetry[board_sname]['firmver'] = 'no data'
    telemetry[board_sname]['ip'] = ''
    telemetry[board_sname]['connection'] = 'never'
    telemetry[board_sname]['swarm'] = 'no data'
    telemetry[board_sname]['hwarm'] = 'no data'
    telemetry[board_sname]['rssi'] = 'no data'
    telemetry[board_sname]['cmdcount'] = 'no data'
    telemetry[board_sname]['firecount'] = ['no data']*8
    telemetry[board_sname]['res'] = ['no data']*8

    predictions[board_sname] = {}
    predictions[board_sname]['swarm'] = '0'
    predictions[board_sname]['last_cmd'] = ''
    predictions[board_sname]['last_cmd_status'] = ''
    predictions[board_sname]['cmdrequests'] = '0'
    predictions[board_sname]['cmdresponses'] = '0'
    predictions[board_sname]['trycount'] = ['0']*8
    predictions[board_sname]['firecount'] = ['0']*8
    predictions[board_sname]['res'] = ['none']*8

    show['boards'][board_sname] = {}
    show['boards'][board_sname]['location'] = 'inactive'
    show['boards'][board_sname]['channels'] = [{"group": "", "effect": ""}]*8

with open('telemetry.json', 'w') as telemetry_json:
    json.dump(telemetry, telemetry_json, indent=4)

with open('predictions.json', 'w') as predictions_json:
    json.dump(predictions, predictions_json, indent=4)

with open('show.json', 'w') as show_json:
    json.dump(show, show_json, indent=4)

