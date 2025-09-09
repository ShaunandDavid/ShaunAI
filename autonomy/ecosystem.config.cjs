module.exports = {
  apps: [
    {
      name: "ShaunAI",
      cwd: "C:/Users/sacar/ShaunAI/autonomy",
      script: "npm",
      args: "run loop",
      interpreter: "none",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
