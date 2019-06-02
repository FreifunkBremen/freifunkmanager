#!/usr/bin/env python3

#
# Return pre-generated respondd responses (read from a JSON file).
# The JSON file must contain a list of responses (one list entry for each simulated node).
#

import socketserver
import argparse
import socket
import struct
import json
from zlib import compress


def get_handler(inputFile):
    class ResponddUDPHandler(socketserver.BaseRequestHandler):
        def multi_request(self, providernames, nodeData):
            ret = {}
            for name in providernames:
                if name in nodeData:
                    ret[name] = nodeData[name]

            print("reponse: %s" % ret)
            return compress(str.encode(json.dumps(ret)))[2:-4]

        def handle(self):
            requestString = self.request[0].decode('UTF-8').strip()
            socket = self.request[1]

            print("got request: '%s' from '%s'" % (requestString, self.client_address))
            if not(requestString.startswith("GET ")):
                print("unsupported old-style request")
                return

            fp = open(inputFile)
            testData = json.load(fp)
            fp.close()

            response = None
            for nodeData in testData:
                response = self.multi_request(requestString.split(" ")[1:], nodeData)
                socket.sendto(response, self.client_address)
    return ResponddUDPHandler

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', dest='port',
                        default=1001, type=int, metavar='<port>',
                        help='port number to listen on (default 1001)')
    parser.add_argument('-g', dest='group',
                        default='ff02::2:1001', metavar='<group>',
                        help='multicast group (default ff02::2:1001)')
    parser.add_argument('-i', dest='mcast_ifaces',
                        action='append', metavar='<iface>',
                        help='interface on which the group is joined')
    parser.add_argument('-f', dest='input_file',
                        type=str, metavar='<file>',
                        required=True,
                        help='JSON file to read responses from')
    args = parser.parse_args()

    socketserver.ThreadingUDPServer.address_family = socket.AF_INET6
    server = socketserver.ThreadingUDPServer(("", args.port), get_handler(args.input_file))

    if args.mcast_ifaces:
        group_bin = socket.inet_pton(socket.AF_INET6, args.group)
        for (inf_id, inf_name) in socket.if_nameindex():
            if inf_name in args.mcast_ifaces:
                mreq = group_bin + struct.pack('@I', inf_id)
                server.socket.setsockopt(
                    socket.IPPROTO_IPV6,
                    socket.IPV6_JOIN_GROUP,
                    mreq
                )

    server.serve_forever()
