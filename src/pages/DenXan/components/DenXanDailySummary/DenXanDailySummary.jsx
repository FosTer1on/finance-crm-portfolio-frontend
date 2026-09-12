import { Alert, Button, Card, Col, Row, Typography } from "antd";

import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./DenXanDailySummary.module.css";

const { Text, Title } = Typography;

function SummaryValue({ label, value, currency = "сум", emptyText = "—" }) {
  return (
    <div className={styles.item}>
      <Text type="secondary" className={styles.label}>
        {label}
      </Text>

      <div className={styles.value}>
        {value == null || value === "" ? (
          <Text type="secondary">{emptyText}</Text>
        ) : (
          <MoneyText value={value} currency={currency} />
        )}
      </div>
    </div>
  );
}

export default function DenXanDailySummary({
  summary,
  loading = false,
  error = "",
  onRetry,
}) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Не удалось загрузить дневную сводку DEN XAN"
        description={error}
        action={
          <Button size="small" loading={loading} onClick={onRetry}>
            Повторить
          </Button>
        }
      />
    );
  }

  if (loading && !summary) {
    return <Card loading />;
  }

  if (!summary) {
    return (
      <Alert type="info" showIcon message="Дневная сводка пока недоступна" />
    );
  }

  const { incoming, outgoing, vat, expenses, losses, rates } = summary;

  return (
    <div className={styles.root}>
      <Row gutter={[12, 12]}>
        <Col xs={24} xl={12}>
          <Card className={styles.card} title="Приходы">
            <div className={styles.grid}>
              <SummaryValue
                label="Общий приход"
                value={incoming?.gross_incoming_total}
              />

              <SummaryValue
                label="Редиректы"
                value={incoming?.redirect_amount_total}
              />

              <SummaryValue
                label="Комиссия редиректов"
                value={incoming?.redirect_debit_fee_total}
              />

              <SummaryValue
                label="После редиректов"
                value={incoming?.amount_after_redirect_total}
              />

              <SummaryValue
                label="Чистое движение по банку"
                value={incoming?.bank_net_effect_total}
              />

              <SummaryValue
                label="Отдать Джамшиду"
                value={incoming?.cash_to_give_jamshid_total}
              />

              <SummaryValue
                label="Приход НДС"
                value={incoming?.vat_incoming_amount_total}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className={styles.card} title="Исходы">
            <div className={styles.grid}>
              <SummaryValue
                label="Общий исход"
                value={outgoing?.amount_total}
              />

              <SummaryValue
                label="Получить от MMA"
                value={outgoing?.cash_to_receive_from_mma_total}
              />

              <SummaryValue
                label="Комиссия исходов"
                value={outgoing?.debit_fee_total}
              />

              <SummaryValue
                label="Списано со счёта"
                value={outgoing?.total_account_debit}
              />

              <div className={styles.item}>
                <Text type="secondary" className={styles.label}>
                  Количество операций
                </Text>

                <Text strong>{outgoing?.operations_count ?? 0}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className={styles.card} title="Обычные исходы">
            <div className={styles.grid}>
              <SummaryValue
                label="Сумма"
                value={outgoing?.regular?.amount_total}
              />

              <SummaryValue
                label="Получить от MMA"
                value={outgoing?.regular?.cash_to_receive_from_mma_total}
              />

              <SummaryValue
                label="Комиссия банка"
                value={outgoing?.regular?.debit_fee_total}
              />

              <div className={styles.item}>
                <Text type="secondary" className={styles.label}>
                  Операций
                </Text>

                <Text strong>{outgoing?.regular?.operations_count ?? 0}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className={styles.card} title="НДС исходы">
            <div className={styles.grid}>
              <SummaryValue label="Сумма" value={outgoing?.vat?.amount_total} />

              <SummaryValue
                label="Получить от MMA"
                value={outgoing?.vat?.cash_to_receive_from_mma_total}
              />

              <SummaryValue
                label="Комиссия банка"
                value={outgoing?.vat?.debit_fee_total}
              />

              <div className={styles.item}>
                <Text type="secondary" className={styles.label}>
                  Операций
                </Text>

                <Text strong>{outgoing?.vat?.operations_count ?? 0}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className={styles.card} title="НДС">
            <div className={styles.grid}>
              <SummaryValue
                label="Приход НДС"
                value={vat?.incoming_amount_total}
              />

              <SummaryValue
                label="Исход НДС"
                value={vat?.outgoing_amount_total}
              />

              <SummaryValue
                label="Получить от MMA"
                value={vat?.cash_to_receive_from_mma_total}
              />

              <SummaryValue
                label="Комиссия исходов НДС"
                value={vat?.outgoing_debit_fee_total}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className={styles.card} title="Расходы">
            <div className={styles.grid}>
              <SummaryValue
                label="Комиссии редиректов"
                value={expenses?.redirect_debit_fee_total}
              />

              <SummaryValue
                label="Комиссии исходов"
                value={expenses?.outgoing_debit_fee_total}
              />

              <SummaryValue
                label="Прочие расходы"
                value={expenses?.other_expense_total}
              />

              <SummaryValue
                label="Всего расходов"
                value={expenses?.expenses_total}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card className={styles.lossCard}>
        <div className={styles.lossHeader}>
          <div>
            <Title level={5} className={styles.lossTitle}>
              Потери и курсы
            </Title>

            <Text type="secondary">Значения рассчитаны backend</Text>
          </div>
        </div>

        <div className={styles.lossGrid}>
          <SummaryValue
            label="Курс DEN XAN"
            value={rates?.den_xan_rate}
            currency={null}
            emptyText="Курс не задан"
          />

          <SummaryValue
            label="Уличный курс"
            value={rates?.street_rate}
            currency={null}
            emptyText="Курс не задан"
          />

          <SummaryValue label="Обычный убыток" value={losses?.regular_loss} />

          <SummaryValue
            label="Джамшид USD по DEN XAN"
            value={losses?.jamshid_usd_den_xan}
            currency="$"
          />

          <SummaryValue
            label="Джамшид USD по улице"
            value={losses?.jamshid_usd_street}
            currency="$"
          />

          <SummaryValue
            label="Курсовой убыток USD"
            value={losses?.currency_loss_usd}
            currency="$"
          />

          <SummaryValue
            label="Курсовой убыток UZS"
            value={losses?.currency_loss_uzs}
          />

          <SummaryValue label="Общий убыток" value={losses?.total_loss} />
        </div>
      </Card>
    </div>
  );
}
