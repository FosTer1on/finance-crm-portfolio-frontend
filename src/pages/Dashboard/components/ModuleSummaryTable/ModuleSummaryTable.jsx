import { Button } from "antd";

import MoneyText from "@/components/finance/MoneyText/MoneyText";

import ClearingModuleDetails from "../ClearingModuleDetails/ClearingModuleDetails";
import AsiaModuleDetails from "../AsiaModuleDetails/AsiaModuleDetails";
import TarleModuleDetails from "../TarleModuleDetails/TarleModuleDetails";
import DenXanModuleDetails from "../DenXanModuleDetails/DenXanModuleDetails";
import MmaModuleDetails from "../MmaModuleDetails/MmaModuleDetails";

import {
  MODULE_NAMES,
  getResultLabel,
  getResultTone,
  sortDashboardModules,
} from "../../utils/dashboard";

import styles from "./ModuleSummaryTable.module.css";

function StandardResult({ module }) {
  const tone = getResultTone(module.result_type);

  return (
    <div className={styles.result}>
      <span className={styles.resultLabel}>
        {getResultLabel(module.result_type)}
      </span>

      <MoneyText
        value={module.result_amount ?? "0"}
        currency="UZS"
        tone={tone}
      />
    </div>
  );
}

function StandardModuleValues({ module }) {
  return (
    <>
      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Получить</span>

        <MoneyText value={module.cash_to_receive_total ?? "0"} currency="UZS" />
      </div>

      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Отдать</span>

        <MoneyText value={module.cash_to_give_total ?? "0"} currency="UZS" />
      </div>

      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Результат</span>

        <StandardResult module={module} />
      </div>
    </>
  );
}

function DenXanValues({ module }) {
  return (
    <>
      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Отдать Жамшиду</span>

        <MoneyText
          value={module.cash_to_give_jamshid_total ?? "0"}
          currency="UZS"
        />
      </div>

      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Получить от MMA</span>

        <MoneyText
          value={module.regular_cash_to_receive_from_mma_total ?? "0"}
          currency="UZS"
        />
      </div>

      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Убыток</span>

        <div className={styles.result}>
          <span className={styles.resultLabel}>Убыток</span>

          <MoneyText
            value={module.total_loss ?? "0"}
            currency="UZS"
            tone="negative"
          />
        </div>
      </div>
    </>
  );
}

function MmaValues({ module }) {
  return (
    <>
      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Получить</span>

        <MoneyText value={module.cash_to_receive_total ?? "0"} currency="UZS" />
      </div>

      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Отдать</span>

        <MoneyText value={module.cash_to_give_total ?? "0"} currency="UZS" />
      </div>

      <div className={styles.moneyCell}>
        <span className={styles.mobileLabel}>Результат</span>

        <StandardResult module={module} />
      </div>
    </>
  );
}

function ModuleValues({ module }) {
  if (module.code === "DEN_XAN") {
    return <DenXanValues module={module} />;
  }

  if (module.code === "MMA") {
    return <MmaValues module={module} />;
  }

  return <StandardModuleValues module={module} />;
}

export default function ModuleSummaryTable({
  modules = [],
  expandedModule = null,
  onToggle,
  date,
}) {
  const sortedModules = sortDashboardModules(modules);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>ФИРМЫ И ВЗАИМОРАСЧЁТЫ</div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Модуль</span>
          <span>Получить / Приход</span>
          <span>Отдать / Исход</span>
          <span>Результат</span>
          <span>Действие</span>
        </div>

        {sortedModules.map((module) => {
          const expanded = expandedModule === module.code;

          return (
            <div className={styles.module} key={module.code}>
              <div className={styles.row}>
                <div className={styles.moduleName}>
                  {MODULE_NAMES[module.code] ?? module.code}
                </div>

                <ModuleValues module={module} />

                <div className={styles.action}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => onToggle?.(module.code)}
                  >
                    {expanded ? "Свернуть" : "Развернуть"}
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className={styles.expandedContent}>
                  {module.code === "CLEARING" && (
                    <ClearingModuleDetails date={date} />
                  )}

                  {module.code === "ASIA" && <AsiaModuleDetails date={date} />}

                  {module.code === "TARLE" && (
                    <TarleModuleDetails date={date} />
                  )}

                  {module.code === "DEN_XAN" && (
                    <DenXanModuleDetails date={date} />
                  )}

                  {module.code === "MMA" && <MmaModuleDetails date={date} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
