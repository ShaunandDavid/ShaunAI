module.exports = {
  apps: [
    {
      name: "ShaunAI",
      cwd: "C:/Users/sacar/ShaunAI/autonomy",
      script: "npm",
      args: "run loop",
      interpreter: process.platform === "win32" ? undefined : "none",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
