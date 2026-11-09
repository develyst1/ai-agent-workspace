// bun silent-listener.ts <port>  — a TCP listener that accepts connections and never answers. Test stand-in only.
Bun.listen({ hostname: "0.0.0.0", port: Number(process.argv[2]), socket: { open() {}, data() {}, close() {} } });
