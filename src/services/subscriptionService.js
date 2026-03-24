import { apiFetch } from './authService'

export async function fetchSubscriptions() {
  return apiFetch('/subscriptions')
}

export async function addSubscription({ classname, hotel, furniName, furniType, basePrice, alertConfig }) {
  return apiFetch('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ classname, hotel, furniName, furniType, basePrice, alertConfig }),
  })
}

export async function removeSubscription(classname, hotel = 'br') {
  return apiFetch(`/subscriptions/${encodeURIComponent(classname)}?hotel=${hotel}`, {
    method: 'DELETE',
  })
}

export async function updateAlertConfig(classname, hotel = 'br', alertConfig) {
  return apiFetch(`/subscriptions/${encodeURIComponent(classname)}/alert`, {
    method: 'PATCH',
    body: JSON.stringify({ hotel, alertConfig }),
  })
}