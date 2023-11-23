#!/usr/bin/env node

import "dotenv/config";

import { mkdir } from "fs/promises";
import { checkbox, confirm } from "@inquirer/prompts";
import { PromisePool } from "@supercharge/promise-pool";

import { ALL_TEMPLATES, CONCURRENCY, TEMPLATES_PATH } from "./config";
import { start } from "./hot-reload";
import { createProgressBar, logger } from "./logger";
import { watch } from "chokidar";

async function main() {
  try {
    await mkdir(TEMPLATES_PATH, { recursive: true });

    const download = await confirm({
      message: "Deseja fazer download dos templates do site?",
      default: false,
    });

    if (download) {
      const templateIds = await checkbox({
        message: "Selecione os templates para baixar",
        choices: [{ name: "Todos", value: "all" }, ...ALL_TEMPLATES],
      });

      const templates = templateIds.includes("all")
        ? ALL_TEMPLATES
        : templateIds.map((templateId) => ALL_TEMPLATES.find((template) => template.value === templateId)!);

      const bar = createProgressBar("Baixando templates", templates.length);

      await PromisePool.for(templates)
        .withConcurrency(CONCURRENCY)
        .onTaskStarted(() => bar.tick())
        .process((template) => template.download());
    }

    const hr = await start();

    watch(TEMPLATES_PATH)
      .on("ready", () => {
        logger.info("Observando alterações nos templates, pressione Ctrl+C para sair");
      })
      .on("change", async (path) => {
        const template = ALL_TEMPLATES.find((template) => template.localPath === path)!;
        logger.info(`Template [${template.value}] alterado, enviando para a plataforma`);

        await template.upload();
        hr.emit("reload");

        logger.success(`Template atualizado`);
      });
  } catch (e) {
    //
  }
}

main();
