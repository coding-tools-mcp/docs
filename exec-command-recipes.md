# Exec Command Recipes

These recipes intentionally use explicit `exec_command` commands. The MCP server does not infer project type, install dependencies automatically, or choose package-manager cache policy.

Use `.coding-tools/cache` when you want workspace-local dependency caches:

```bash
MAVEN_USER_HOME=.coding-tools/cache/m2 mvn test
GRADLE_USER_HOME=.coding-tools/cache/gradle ./gradlew test
npm_config_cache=.coding-tools/cache/npm npm ci && npm test
PIP_CACHE_DIR=.coding-tools/cache/pip python -m pip install -r requirements.txt && python -m pytest
GOCACHE=.coding-tools/cache/go-build GOMODCACHE=.coding-tools/cache/go-mod go test ./...
CARGO_HOME=.coding-tools/cache/cargo cargo test
cmake -S . -B .coding-tools/build && cmake --build .coding-tools/build && ctest --test-dir .coding-tools/build
```

Primitive toolchain checks:

```bash
java -version
javac -version
mvn -version
gcc --version
g++ --version
make --version
cmake --version
node --version
npm --version
python --version
pip --version
go version
cargo --version
rustc --version
```

If dependencies need network access, start with:

```bash
coding-tools-mcp --permission-mode trusted --workspace /path/to/repo
```
