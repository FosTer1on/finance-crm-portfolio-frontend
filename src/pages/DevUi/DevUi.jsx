import { useCallback, useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { Button, Input, Space } from "antd";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import CompanySelect from "@/components/finance/CompanySelect/CompanySelect";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import CurrencySelect from "@/components/finance/CurrencySelect/CurrencySelect";
import DailyTotals from "@/components/finance/DailyTotals/DailyTotals";
import DayStatus from "@/components/finance/DayStatus/DayStatus";
import DualOperationFormLayout from "@/components/finance/DualOperationFormLayout/DualOperationFormLayout";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";
import PercentInput from "@/components/finance/PercentInput/PercentInput";
import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";
import { usePairedFormNavigation } from "@/hooks/usePairedFormNavigation";

import { amountAfterPercent } from "@/utils/finance";

import { showSuccess } from "@/utils/feedback";

import styles from "./DevUi.module.css";

const INITIAL_FORM = {
  counterpartyId: undefined,
  companyId: undefined,
  amount: "",
  percent: "",
  currency: "UZS",
  comment: "",
};

const DEMO_FIELDS = [
  "counterparty",
  "company",
  "amount",
  "percent",
  "currency",
  "comment",
];

const PAIRED_FIELDS = [
  "counterparty",
  "company",
  "amount",
  "percent",
  "comment",
];

const FIELD_PAIRS = [
  {
    left: "counterparty",
    right: "counterparty",
  },
  {
    left: "company",
    right: "company",
  },
  {
    left: "amount",
    right: "amount",
  },
  {
    left: "percent",
    right: "percent",
  },
  {
    left: "comment",
    right: "comment",
  },
];

export default function DevUi() {
  const [form, setForm] = useState(INITIAL_FORM);

  const [leftForm, setLeftForm] = useState({
    counterpartyId: undefined,
    companyId: undefined,
    amount: "",
    percent: "",
    comment: "",
  });

  const [rightForm, setRightForm] = useState({
    counterpartyId: undefined,
    companyId: undefined,
    amount: "",
    percent: "",
    comment: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [businessDate, setBusinessDate] = useState(dayjs());

  const preview = amountAfterPercent(form.amount, form.percent);

  const submitRef = useRef(null);

  const navigation = useFormKeyboardNavigation({
    fields: DEMO_FIELDS,

    onSubmit: () => {
      submitRef.current?.();
    },
  });

  const { focusFirst } = navigation;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      focusFirst();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [focusFirst]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateLeftField = (field, value) => {
    setLeftForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateRightField = (field, value) => {
    setRightForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const leftNavigation = useFormKeyboardNavigation({
    fields: PAIRED_FIELDS,
  });

  const rightNavigation = useFormKeyboardNavigation({
    fields: PAIRED_FIELDS,
  });

  const pairedNavigation = usePairedFormNavigation({
    leftNavigation,
    rightNavigation,
    pairs: FIELD_PAIRS,
  });

  const handleSubmit = useCallback(() => {
    if (!form.counterpartyId || !form.amount) {
      return;
    }

    showSuccess("Тестовая операция сохранена");

    setForm({
      ...INITIAL_FORM,
    });

    window.setTimeout(() => {
      focusFirst();
    }, 0);
  }, [form.counterpartyId, form.amount, focusFirst]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>UI Showcase</h1>
          <p>Shared components и keyboard workflow</p>
        </div>

        <Space>
          <BusinessDatePicker value={businessDate} onChange={setBusinessDate} />

          <DayStatus status="OPEN" />
        </Space>
      </div>

      <DualOperationFormLayout
        leftTitle="Keyboard test"
        left={
          <div className={styles.form}>
            <CounterpartySelect
              ref={navigation.registerField("counterparty")}
              value={form.counterpartyId}
              onChange={(value) => {
                updateField("counterpartyId", value);

                if (value != null) {
                  window.setTimeout(() => {
                    navigation.focusNext("counterparty");
                  }, 0);
                }
              }}
            />

            <CompanySelect
              ref={navigation.registerField("company")}
              value={form.companyId}
              onChange={(value) => {
                updateField("companyId", value);

                if (value != null) {
                  window.setTimeout(() => {
                    navigation.focusNext("company");
                  }, 0);
                }
              }}
            />

            <MoneyInput
              ref={navigation.registerField("amount")}
              value={form.amount}
              onChange={(value) => updateField("amount", value)}
              onKeyDown={navigation.getEnterKeyDown("amount")}
              placeholder="Сумма"
            />

            <PercentInput
              ref={navigation.registerField("percent")}
              value={form.percent}
              onChange={(value) => updateField("percent", value)}
              onKeyDown={navigation.getEnterKeyDown("percent")}
              placeholder="Процент"
            />

            <CurrencySelect
              ref={navigation.registerField("currency")}
              value={form.currency}
              onChange={(value) => {
                updateField("currency", value);

                window.setTimeout(() => {
                  navigation.focusNext("currency");
                }, 0);
              }}
              onAccept={() => {
                window.setTimeout(() => {
                  navigation.focusNext("currency");
                }, 0);
              }}
            />

            <Input.TextArea
              ref={navigation.registerField("comment")}
              value={form.comment}
              onChange={(event) => updateField("comment", event.target.value)}
              onKeyDown={navigation.getEnterKeyDown("comment", {
                multiline: true,
                submitOnEnter: true,
              })}
              placeholder="Комментарий"
              autoSize={{
                minRows: 2,
                maxRows: 4,
              }}
            />

            <div>
              После процента:{" "}
              <MoneyText value={preview ?? "0"} currency={form.currency} />
            </div>

            <Space>
              <Button type="primary" onClick={handleSubmit}>
                Сохранить
              </Button>

              <Button danger onClick={() => setConfirmOpen(true)}>
                Проверить modal
              </Button>
            </Space>
          </div>
        }
        rightTitle="Shared components"
        right={
          <div className={styles.form}>
            <MoneyText value="150000000" currency="UZS" />

            <MoneyText value="12500.50" currency="USD" tone="positive" />

            <DayStatus status="CLOSED" />

            <DailyTotals
              items={[
                {
                  key: "incoming",
                  label: "Приход",
                  value: "150000000",
                  currency: "UZS",
                },
                {
                  key: "outgoing",
                  label: "Исход",
                  value: "90000000",
                  currency: "UZS",
                },
              ]}
            />
          </div>
        }
      />

      <div className={styles.pairedSection}>
        <h2>Paired keyboard navigation</h2>

        <p className={styles.pairedDescription}>
          Enter — вниз внутри формы. Tab — на такое же поле соседней формы.
        </p>

        <DualOperationFormLayout
          leftTitle="Приход"
          left={
            <div className={styles.form}>
              <CounterpartySelect
                ref={leftNavigation.registerField("counterparty")}
                value={leftForm.counterpartyId}
                onChange={(value) => {
                  updateLeftField("counterpartyId", value);

                  if (value != null) {
                    window.setTimeout(() => {
                      leftNavigation.focusNext("counterparty");
                    }, 0);
                  }
                }}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "left",
                  fieldName: "counterparty",
                })}
                placeholder="Человек"
              />

              <CompanySelect
                ref={leftNavigation.registerField("company")}
                value={leftForm.companyId}
                onChange={(value) => {
                  updateLeftField("companyId", value);

                  if (value != null) {
                    window.setTimeout(() => {
                      leftNavigation.focusNext("company");
                    }, 0);
                  }
                }}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "left",
                  fieldName: "company",
                })}
              />

              <MoneyInput
                ref={leftNavigation.registerField("amount")}
                value={leftForm.amount}
                onChange={(value) => updateLeftField("amount", value)}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "left",
                  fieldName: "amount",
                  onEnterKeyDown: leftNavigation.getEnterKeyDown("amount"),
                })}
                placeholder="Сумма"
              />

              <PercentInput
                ref={leftNavigation.registerField("percent")}
                value={leftForm.percent}
                onChange={(value) => updateLeftField("percent", value)}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "left",
                  fieldName: "percent",
                  onEnterKeyDown: leftNavigation.getEnterKeyDown("percent"),
                })}
                placeholder="Процент"
              />

              <Input.TextArea
                ref={leftNavigation.registerField("comment")}
                value={leftForm.comment}
                onChange={(event) =>
                  updateLeftField("comment", event.target.value)
                }
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "left",
                  fieldName: "comment",
                })}
                placeholder="Комментарий"
                autoSize={{
                  minRows: 2,
                  maxRows: 4,
                }}
              />
            </div>
          }
          rightTitle="Исход"
          right={
            <div className={styles.form}>
              <CounterpartySelect
                ref={rightNavigation.registerField("counterparty")}
                value={rightForm.counterpartyId}
                onChange={(value) => {
                  updateRightField("counterpartyId", value);

                  if (value != null) {
                    window.setTimeout(() => {
                      rightNavigation.focusNext("counterparty");
                    }, 0);
                  }
                }}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "right",
                  fieldName: "counterparty",
                })}
                placeholder="Человек"
              />

              <CompanySelect
                ref={rightNavigation.registerField("company")}
                value={rightForm.companyId}
                onChange={(value) => {
                  updateRightField("companyId", value);

                  if (value != null) {
                    window.setTimeout(() => {
                      rightNavigation.focusNext("company");
                    }, 0);
                  }
                }}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "right",
                  fieldName: "company",
                })}
              />

              <MoneyInput
                ref={rightNavigation.registerField("amount")}
                value={rightForm.amount}
                onChange={(value) => updateRightField("amount", value)}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "right",
                  fieldName: "amount",
                  onEnterKeyDown: rightNavigation.getEnterKeyDown("amount"),
                })}
                placeholder="Сумма"
              />

              <PercentInput
                ref={rightNavigation.registerField("percent")}
                value={rightForm.percent}
                onChange={(value) => updateRightField("percent", value)}
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "right",
                  fieldName: "percent",
                  onEnterKeyDown: rightNavigation.getEnterKeyDown("percent"),
                })}
                placeholder="Процент"
              />

              <Input.TextArea
                ref={rightNavigation.registerField("comment")}
                value={rightForm.comment}
                onChange={(event) =>
                  updateRightField("comment", event.target.value)
                }
                onKeyDown={pairedNavigation.getFieldKeyDown({
                  side: "right",
                  fieldName: "comment",
                })}
                placeholder="Комментарий"
                autoSize={{
                  minRows: 2,
                  maxRows: 4,
                }}
              />
            </div>
          }
        />
      </div>

      <ConfirmActionModal
        open={confirmOpen}
        title="Проверка"
        description="Проверяем общий confirm modal."
        confirmText="Подтвердить"
        danger
        onConfirm={() => {
          setConfirmOpen(false);

          showSuccess("Действие подтверждено");
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
