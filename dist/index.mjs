import { useCallback as e, useMemo as t, useState as n } from "react";
import { jsx as r, jsxs as i } from "react/jsx-runtime";
//#region src/components/DynamicForm/DynamicForm.tsx
function a(e) {
	return e.value_type === "BOOLEAN" ? !1 : e.value_type === "ARRAY" ? [] : (e.value_type === "INTEGER" || e.value_type === "BIGINT" || e.value_type === "FLOAT" || e.value_type, "");
}
function o(e) {
	return e && typeof e == "object" && "id" in e ? e.id : e;
}
function s(e, t, n, r) {
	if (!e.options) return null;
	if (!e.depend_on) return e.options;
	let i = t.find((t) => t.name === e.depend_on);
	if (!i) return e.options;
	let a = n[e.depend_on] ?? r?.[e.depend_on];
	if (a === void 0 || a === "" || a === null) return [];
	let s = i.options?.find((e) => {
		let t = o(e.value);
		return String(t) === String(a);
	});
	if (!s) return [];
	let c = o(s.value);
	return e.options.filter((t) => {
		if (!t.value || typeof t.value != "object") return !0;
		let n = t.value, r = `${e.depend_on}_id`;
		if (r in n) return String(n[r]) === String(c);
		for (let e of Object.keys(n)) {
			if (e.endsWith("_ids") && Array.isArray(n[e])) return n[e].map(String).includes(String(c));
			if (e.endsWith("_id") && e !== "id") return String(n[e]) === String(c);
		}
		return !0;
	});
}
function c({ fields: t, onSave: c, title: l, parentValues: u }) {
	let [d, f] = n(() => {
		let e = {};
		return t.forEach((t) => {
			e[t.name] = a(t);
		}), e;
	}), [p, m] = n(!1), [h, g] = n({}), _ = e((e, n) => {
		f((r) => {
			let i = {
				...r,
				[e]: n
			};
			return t.forEach((t) => {
				t.depend_on === e && (i[t.name] = a(t));
			}), i;
		}), g((t) => {
			let n = { ...t };
			return delete n[e], n;
		});
	}, [t]), v = e((e, t) => {
		f((n) => {
			let r = n[e] || [], i = String(t), a = r.map(String).includes(i);
			return {
				...n,
				[e]: a ? r.filter((e) => String(e) !== i) : [...r, t]
			};
		});
	}, []), y = () => {
		let e = {};
		return t.forEach((t) => {
			if (!t.is_required) return;
			let n = d[t.name];
			(n === "" || n == null) && (e[t.name] = "Required field"), t.value_type === "ARRAY" && Array.isArray(n) && n.length === 0 && (e[t.name] = "Select at least one option");
		}), g(e), Object.keys(e).length === 0;
	}, b = async () => {
		if (y()) {
			m(!0);
			try {
				await c({ values: t.map((e) => ({
					name: e.name,
					value: d[e.name]
				})) });
			} finally {
				m(!1);
			}
		}
	}, x = (e) => {
		let n = d[e.name], a = s(e, t, d, u);
		if (e.value_type === "BOOLEAN") return /* @__PURE__ */ i("label", {
			className: "df-checkbox-label",
			children: [/* @__PURE__ */ r("input", {
				type: "checkbox",
				checked: !!n,
				onChange: (t) => _(e.name, t.target.checked)
			}), /* @__PURE__ */ r("span", {
				className: "df-checkbox-text",
				children: e.label
			})]
		});
		if (e.value_type === "DATETIME") return /* @__PURE__ */ r("input", {
			type: "datetime-local",
			className: "df-input",
			value: String(n || ""),
			onChange: (t) => _(e.name, t.target.value)
		});
		if (e.value_type === "ARRAY" && a) {
			let t = n || [];
			return /* @__PURE__ */ r("div", {
				className: "df-chips-container",
				children: a.map((n) => {
					let i = typeof n.value == "object" ? String(o(n.value)) : n.value;
					return /* @__PURE__ */ r("button", {
						type: "button",
						className: `df-chip ${t.map(String).includes(String(i)) ? "df-chip--selected" : ""}`,
						onClick: () => v(e.name, i),
						children: n.label
					}, String(i));
				})
			});
		}
		if (a && a.length > 0) return /* @__PURE__ */ i("select", {
			className: "df-select",
			value: String(n ?? ""),
			onChange: (t) => _(e.name, t.target.value),
			children: [/* @__PURE__ */ r("option", {
				value: "",
				children: "— Select —"
			}), a.map((e) => {
				let t = typeof e.value == "object" ? String(o(e.value)) : String(e.value ?? "");
				return /* @__PURE__ */ r("option", {
					value: t,
					children: e.label
				}, t);
			})]
		});
		if (e.options && e.depend_on && a && a.length === 0) return /* @__PURE__ */ r("select", {
			className: "df-select",
			disabled: !0,
			children: /* @__PURE__ */ r("option", { children: "— Select parent first —" })
		});
		let c = [
			"INTEGER",
			"BIGINT",
			"FLOAT",
			"DOUBLE PRECISION"
		].includes(e.value_type);
		return /* @__PURE__ */ r("input", {
			type: c ? "number" : "text",
			className: "df-input",
			value: String(n ?? ""),
			onChange: (t) => _(e.name, c ? t.target.value === "" ? "" : Number(t.target.value) : t.target.value),
			placeholder: e.label
		});
	};
	return /* @__PURE__ */ i("div", {
		className: "df-container",
		children: [
			l && /* @__PURE__ */ r("h3", {
				className: "df-title",
				children: l
			}),
			/* @__PURE__ */ r("div", {
				className: "df-fields",
				children: t.map((e) => /* @__PURE__ */ i("div", {
					className: "df-field",
					children: [
						e.value_type !== "BOOLEAN" && /* @__PURE__ */ i("label", {
							className: "df-label",
							children: [e.label, e.is_required && /* @__PURE__ */ r("span", {
								className: "df-required",
								children: "*"
							})]
						}),
						x(e),
						h[e.name] && /* @__PURE__ */ r("span", {
							className: "df-error",
							children: h[e.name]
						})
					]
				}, e.name))
			}),
			/* @__PURE__ */ r("button", {
				className: "df-save-btn",
				onClick: b,
				disabled: p,
				children: p ? "Saving..." : "Save"
			})
		]
	});
}
//#endregion
//#region src/components/TemplateGroup/TemplateGroup.tsx
function l({ fetchTemplates: t, onSave: a }) {
	let [o, s] = n(null), [c, l] = n(""), [u, d] = n(null), [f, p] = n([]), [m, h] = n(!1), [g, _] = n(!1), [v, y] = n({}), b = e(async () => {
		h(!0);
		try {
			s(await t());
		} finally {
			h(!1);
		}
	}, [t]), x = () => {
		o || b();
	}, S = () => {
		p((e) => [...e, {
			templateId: null,
			adTemplateIds: []
		}]);
	}, C = (e) => {
		p((t) => t.filter((t, n) => n !== e));
	}, w = (e, t) => {
		p((n) => n.map((n, r) => r === e ? {
			...n,
			templateId: t
		} : n));
	}, T = (e) => {
		p((t) => t.map((t, n) => n === e ? {
			...t,
			adTemplateIds: [...t.adTemplateIds, null]
		} : t));
	}, E = (e, t) => {
		p((n) => n.map((n, r) => r === e ? {
			...n,
			adTemplateIds: n.adTemplateIds.filter((e, n) => n !== t)
		} : n));
	}, D = (e, t, n) => {
		p((r) => r.map((r, i) => i === e ? {
			...r,
			adTemplateIds: r.adTemplateIds.map((e, r) => r === t ? n : e)
		} : r));
	}, O = () => {
		let e = {};
		return c.trim() || (e.groupName = "Group name is required"), u || (e.campaign = "Select a campaign template"), f.length === 0 && (e.adsets = "Add at least one Ad Set"), f.forEach((t, n) => {
			t.templateId || (e[`adset_${n}`] = "Select an adset template"), t.adTemplateIds.length === 0 && (e[`adset_${n}_ads`] = "Add at least one ad"), t.adTemplateIds.forEach((t, r) => {
				t || (e[`adset_${n}_ad_${r}`] = "Select an ad template");
			});
		}), y(e), Object.keys(e).length === 0;
	};
	return o ? /* @__PURE__ */ i("div", {
		className: "tg-container",
		children: [
			/* @__PURE__ */ r("h3", {
				className: "tg-title",
				children: "Template Group"
			}),
			/* @__PURE__ */ i("div", {
				className: "tg-controls",
				children: [/* @__PURE__ */ i("div", {
					className: "tg-field",
					children: [
						/* @__PURE__ */ i("label", {
							className: "tg-label",
							children: ["Group Name ", /* @__PURE__ */ r("span", {
								className: "tg-required",
								children: "*"
							})]
						}),
						/* @__PURE__ */ r("input", {
							className: "tg-input",
							value: c,
							onChange: (e) => l(e.target.value),
							placeholder: "Enter group name"
						}),
						v.groupName && /* @__PURE__ */ r("span", {
							className: "tg-error",
							children: v.groupName
						})
					]
				}), /* @__PURE__ */ i("div", {
					className: "tg-field",
					children: [
						/* @__PURE__ */ i("label", {
							className: "tg-label",
							children: ["Campaign Template ", /* @__PURE__ */ r("span", {
								className: "tg-required",
								children: "*"
							})]
						}),
						/* @__PURE__ */ i("select", {
							className: "tg-select",
							value: u ?? "",
							onChange: (e) => d(Number(e.target.value)),
							children: [/* @__PURE__ */ r("option", {
								value: "",
								children: "— Select Campaign —"
							}), o.campaign_templates.map((e) => /* @__PURE__ */ r("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						}),
						v.campaign && /* @__PURE__ */ r("span", {
							className: "tg-error",
							children: v.campaign
						})
					]
				})]
			}),
			u && /* @__PURE__ */ r("div", {
				className: "tg-graph-area",
				children: /* @__PURE__ */ i("div", {
					className: "tg-graph",
					children: [
						/* @__PURE__ */ r("div", {
							className: "tg-column tg-col-campaign",
							children: /* @__PURE__ */ i("div", {
								className: "tg-block tg-block-campaign",
								children: [/* @__PURE__ */ r("div", {
									className: "tg-block-label",
									children: "Campaign"
								}), /* @__PURE__ */ r("div", {
									className: "tg-block-name",
									children: ((e, t) => e?.find((e) => e.id === t)?.name ?? "—")(o.campaign_templates, u)
								})]
							})
						}),
						/* @__PURE__ */ r("div", {
							className: "tg-connectors",
							children: /* @__PURE__ */ r("svg", {
								className: "tg-svg",
								preserveAspectRatio: "none",
								children: f.map((e, t) => /* @__PURE__ */ r("line", {
									className: "tg-connector-line",
									x1: "0",
									y1: "50%",
									x2: "100%",
									y2: `${f.length === 1 ? 50 : t / (f.length - 1) * 100}%`
								}, `c-as-${t}`))
							})
						}),
						/* @__PURE__ */ i("div", {
							className: "tg-column tg-col-adsets",
							children: [
								f.map((e, t) => /* @__PURE__ */ r("div", {
									className: "tg-adset-row",
									children: /* @__PURE__ */ i("div", {
										className: "tg-block tg-block-adset",
										children: [
											/* @__PURE__ */ i("div", {
												className: "tg-block-header",
												children: [/* @__PURE__ */ r("div", {
													className: "tg-block-label",
													children: "Adset"
												}), /* @__PURE__ */ r("button", {
													className: "tg-block-remove",
													onClick: () => C(t),
													children: "✕"
												})]
											}),
											/* @__PURE__ */ i("select", {
												className: "tg-block-select",
												value: e.templateId ?? "",
												onChange: (e) => w(t, Number(e.target.value)),
												children: [/* @__PURE__ */ r("option", {
													value: "",
													children: "— Select —"
												}), o.adset_templates.map((e) => /* @__PURE__ */ r("option", {
													value: e.id,
													children: e.name
												}, e.id))]
											}),
											v[`adset_${t}`] && /* @__PURE__ */ r("span", {
												className: "tg-error",
												children: v[`adset_${t}`]
											})
										]
									})
								}, t)),
								/* @__PURE__ */ r("button", {
									className: "tg-add-node-btn",
									onClick: S,
									children: "+ Ad Set"
								}),
								v.adsets && /* @__PURE__ */ r("span", {
									className: "tg-error",
									children: v.adsets
								})
							]
						}),
						/* @__PURE__ */ r("div", {
							className: "tg-connectors tg-connectors-mid",
							children: /* @__PURE__ */ r("svg", {
								className: "tg-svg",
								preserveAspectRatio: "none",
								children: (() => {
									let e = [];
									if (f.forEach((t, n) => t.adTemplateIds.forEach((t, r) => e.push({
										adsetIdx: n,
										adIdx: r
									}))), e.length === 0) return null;
									let t = f.length || 1, n = 0, i = e.length;
									return f.map((e, a) => e.adTemplateIds.map((e, o) => {
										let s = t === 1 ? 50 : a / (t - 1) * 100, c = i === 1 ? 50 : n++ / (i - 1) * 100;
										return /* @__PURE__ */ r("line", {
											className: "tg-connector-line",
											x1: "0",
											y1: `${s}%`,
											x2: "100%",
											y2: `${c}%`
										}, `as-ad-${a}-${o}`);
									}));
								})()
							})
						}),
						/* @__PURE__ */ i("div", {
							className: "tg-column tg-col-ads",
							children: [
								f.map((e, t) => e.adTemplateIds.map((e, n) => /* @__PURE__ */ i("div", {
									className: "tg-block tg-block-ad",
									children: [
										/* @__PURE__ */ i("div", {
											className: "tg-block-header",
											children: [/* @__PURE__ */ r("div", {
												className: "tg-block-label",
												children: "Ad"
											}), /* @__PURE__ */ r("button", {
												className: "tg-block-remove",
												onClick: () => E(t, n),
												children: "✕"
											})]
										}),
										/* @__PURE__ */ i("select", {
											className: "tg-block-select",
											value: e ?? "",
											onChange: (e) => D(t, n, Number(e.target.value)),
											children: [/* @__PURE__ */ r("option", {
												value: "",
												children: "— Select —"
											}), o.ad_templates.map((e) => /* @__PURE__ */ r("option", {
												value: e.id,
												children: e.name
											}, e.id))]
										}),
										v[`adset_${t}_ad_${n}`] && /* @__PURE__ */ r("span", {
											className: "tg-error",
											children: v[`adset_${t}_ad_${n}`]
										})
									]
								}, `${t}-${n}`))),
								f.length > 0 && /* @__PURE__ */ r("div", {
									className: "tg-add-ad-buttons",
									children: f.map((e, t) => /* @__PURE__ */ i("button", {
										className: "tg-add-node-btn tg-add-node-btn--small",
										onClick: () => T(t),
										children: [
											"+ Ad (Set #",
											t + 1,
											")"
										]
									}, t))
								}),
								f.some((e, t) => v[`adset_${t}_ads`]) && /* @__PURE__ */ r("span", {
									className: "tg-error",
									children: "Each Ad Set needs at least one Ad"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ r("button", {
				className: "tg-save-btn",
				onClick: async () => {
					if (O()) {
						_(!0);
						try {
							await a({
								templates_group_name: c,
								campaign_template_id: u,
								adset_templates: f.map((e) => ({
									adset_template_id: e.templateId,
									ad_templates: e.adTemplateIds.map((e) => ({ ad_template_id: e }))
								}))
							});
						} finally {
							_(!1);
						}
					}
				},
				disabled: g,
				children: g ? "Saving..." : "Save Template Group"
			})
		]
	}) : /* @__PURE__ */ r("div", {
		className: "tg-container",
		children: /* @__PURE__ */ r("button", {
			className: "tg-load-btn",
			onClick: x,
			disabled: m,
			children: m ? "Loading..." : "Load Templates"
		})
	});
}
//#endregion
//#region src/components/LaunchGroup/LaunchGroup.tsx
function u(e) {
	return e && typeof e == "object" && "id" in e ? e.id : e;
}
function d(e, t, n, r) {
	if (!e.options) return [];
	if (!e.depend_on) return e.options;
	let i = {
		...r,
		...n
	}[e.depend_on];
	if (i === void 0 || i === "" || i === null) return [];
	let a = [...t].find((t) => t.name === e.depend_on), o = i;
	if (a?.options) {
		let e = a.options.find((e) => String(u(e.value)) === String(i));
		e && (o = u(e.value));
	}
	return e.options.filter((e) => {
		if (!e.value || typeof e.value != "object") return !0;
		let t = e.value;
		for (let e of Object.keys(t)) if (e !== "id") {
			if (e.endsWith("_ids") && Array.isArray(t[e])) return t[e].map(String).includes(String(o));
			if (e.endsWith("_id")) return String(t[e]) === String(o);
		}
		return !0;
	});
}
function f(e, t) {
	let n = {};
	return Object.assign(n, e.campaignValues[t.groupIndex] ?? {}), (t.level === "adset" || t.level === "ad") && t.adsetIndex !== void 0 && Object.assign(n, e.adsetValues[t.groupIndex]?.[t.adsetIndex] ?? {}), n;
}
function p(e) {
	return Object.values(e).some((e) => e !== "" && e != null);
}
function m({ fetchTemplateGroups: a, fetchCampaignFields: o, fetchAdsetFields: s, fetchAdFields: c, onSave: l }) {
	let [m, h] = n(null), [g, _] = n([]), [v, y] = n([]), [b, x] = n([]), [S, C] = n([]), [w, T] = n(!1), [E, D] = n(!1), O = e(async () => {
		T(!0);
		try {
			let [e, t, n, r] = await Promise.all([
				a(),
				o(),
				s(),
				c()
			]);
			_(t), y(n), x(r), h({
				groups: e,
				campaignValues: e.map(() => ({})),
				adsetValues: e.map((e) => e.adset_templates.map(() => ({}))),
				adValues: e.map((e) => e.adset_templates.map((e) => e.ad_templates.map(() => ({}))))
			});
		} finally {
			T(!1);
		}
	}, [
		a,
		o,
		s,
		c
	]), k = e((e) => S.some((t) => t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level), [S]), A = e((e) => {
		C((t) => t.some((t) => t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level) ? t.filter((t) => !(t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level)) : [...t, e]);
	}, []), j = e((e) => {
		if (!m) return;
		let t = [];
		m.groups.forEach((n, r) => {
			e === "campaign" && t.push({
				groupIndex: r,
				level: "campaign"
			}), n.adset_templates.forEach((i, a) => {
				e === "adset" && t.push({
					groupIndex: r,
					adsetIndex: a,
					level: "adset"
				}), e === "ad" && n.adset_templates[a].ad_templates.forEach((e, n) => {
					t.push({
						groupIndex: r,
						adsetIndex: a,
						adIndex: n,
						level: "ad"
					});
				});
			});
		}), C((n) => t.every((e) => n.some((t) => t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level)) ? n.filter((t) => t.level !== e) : [...n.filter((t) => t.level !== e), ...t]);
	}, [m]), M = e((e, t) => {
		m && h((n) => {
			if (!n) return n;
			let r = n.campaignValues.map((e) => ({ ...e })), i = n.adsetValues.map((e) => e.map((e) => ({ ...e }))), a = n.adValues.map((e) => e.map((e) => e.map((e) => ({ ...e }))));
			for (let n of S) n.level === "campaign" ? (r[n.groupIndex][e] = t, g.filter((t) => t.depend_on === e).forEach((e) => {
				r[n.groupIndex][e.name] = "";
			}), v.filter((t) => t.depend_on === e).forEach((e) => {
				i[n.groupIndex].forEach((t) => {
					t[e.name] = "";
				});
			}), b.filter((t) => t.depend_on === e).forEach((e) => {
				a[n.groupIndex].forEach((t) => {
					t.forEach((t) => {
						t[e.name] = "";
					});
				});
			})) : n.level === "adset" && n.adsetIndex !== void 0 ? (i[n.groupIndex][n.adsetIndex][e] = t, v.filter((t) => t.depend_on === e).forEach((e) => {
				i[n.groupIndex][n.adsetIndex][e.name] = "";
			})) : n.level === "ad" && n.adsetIndex !== void 0 && n.adIndex !== void 0 && (a[n.groupIndex][n.adsetIndex][n.adIndex][e] = t);
			return {
				...n,
				campaignValues: r,
				adsetValues: i,
				adValues: a
			};
		});
	}, [
		m,
		S,
		g,
		v,
		b
	]), N = t(() => {
		if (S.length === 0) return null;
		let e = new Set(S.map((e) => e.level));
		return e.size === 1 ? [...e][0] : null;
	}, [S]), P = t(() => N === "campaign" ? g : N === "adset" ? v : N === "ad" ? b : [], [
		N,
		g,
		v,
		b
	]), F = t(() => [
		...g,
		...v,
		...b
	], [
		g,
		v,
		b
	]), I = t(() => {
		if (!m || S.length === 0) return {};
		let e = S[0];
		return e.level === "campaign" ? m.campaignValues[e.groupIndex] ?? {} : e.level === "adset" && e.adsetIndex !== void 0 ? m.adsetValues[e.groupIndex]?.[e.adsetIndex] ?? {} : e.level === "ad" && e.adsetIndex !== void 0 && e.adIndex !== void 0 ? m.adValues[e.groupIndex]?.[e.adsetIndex]?.[e.adIndex] ?? {} : {};
	}, [m, S]), L = t(() => !m || S.length === 0 ? {} : f(m, S[0]), [m, S]);
	return m ? /* @__PURE__ */ i("div", {
		className: "lg-container",
		children: [
			/* @__PURE__ */ i("div", {
				className: "lg-header",
				children: [/* @__PURE__ */ r("h3", {
					className: "lg-title",
					children: "Launch Groups"
				}), /* @__PURE__ */ i("div", {
					className: "lg-select-all-bar",
					children: [
						/* @__PURE__ */ r("button", {
							className: `lg-select-all-btn ${N === "campaign" ? "lg-select-all-btn--active" : ""}`,
							onClick: () => j("campaign"),
							children: "Select All Campaigns"
						}),
						/* @__PURE__ */ r("button", {
							className: `lg-select-all-btn ${N === "adset" ? "lg-select-all-btn--active" : ""}`,
							onClick: () => j("adset"),
							children: "Select All Ad Sets"
						}),
						/* @__PURE__ */ r("button", {
							className: `lg-select-all-btn ${N === "ad" ? "lg-select-all-btn--active" : ""}`,
							onClick: () => j("ad"),
							children: "Select All Ads"
						}),
						S.length > 0 && /* @__PURE__ */ i("button", {
							className: "lg-clear-btn",
							onClick: () => C([]),
							children: [
								"Clear (",
								S.length,
								")"
							]
						})
					]
				})]
			}),
			S.length === 0 ? /* @__PURE__ */ r("div", {
				className: "lg-form-panel lg-form-panel--empty",
				children: /* @__PURE__ */ r("span", {
					className: "lg-placeholder",
					children: "Select one or more nodes to edit their parameters"
				})
			}) : N ? /* @__PURE__ */ i("div", {
				className: "lg-form-panel",
				children: [
					/* @__PURE__ */ i("div", {
						className: "lg-form-header",
						children: [
							"Editing ",
							S.length,
							" ",
							N,
							"(s)"
						]
					}),
					/* @__PURE__ */ r("div", {
						className: "lg-form-fields",
						children: P.map((e) => {
							let t = I[e.name] ?? "", n = d(e, F, I, L);
							return /* @__PURE__ */ i("div", {
								className: "lg-field",
								children: [/* @__PURE__ */ i("label", {
									className: "lg-label",
									children: [
										e.label,
										e.is_required && /* @__PURE__ */ r("span", {
											className: "lg-required",
											children: "*"
										}),
										e.depend_on && /* @__PURE__ */ i("span", {
											className: "lg-depend-tag",
											children: ["depends on: ", e.depend_on]
										})
									]
								}), e.value_type === "BOOLEAN" ? /* @__PURE__ */ i("label", {
									className: "lg-checkbox-label",
									children: [/* @__PURE__ */ r("input", {
										type: "checkbox",
										checked: !!t,
										onChange: (t) => M(e.name, t.target.checked)
									}), /* @__PURE__ */ r("span", { children: e.label })]
								}) : e.value_type === "DATETIME" ? /* @__PURE__ */ r("input", {
									type: "datetime-local",
									className: "lg-input",
									value: String(t || ""),
									onChange: (t) => M(e.name, t.target.value)
								}) : e.value_type === "ARRAY" && n.length > 0 ? /* @__PURE__ */ r("div", {
									className: "lg-chips",
									children: n.map((n) => {
										let i = typeof n.value == "object" ? String(u(n.value)) : String(n.value), a = Array.isArray(t) ? t : [], o = a.map(String).includes(i);
										return /* @__PURE__ */ r("button", {
											type: "button",
											className: `lg-chip ${o ? "lg-chip--selected" : ""}`,
											onClick: () => M(e.name, o ? a.filter((e) => String(e) !== i) : [...a, n.value]),
											children: n.label
										}, i);
									})
								}) : n.length > 0 ? /* @__PURE__ */ i("select", {
									className: "lg-select",
									value: String(t ?? ""),
									onChange: (t) => M(e.name, t.target.value),
									children: [/* @__PURE__ */ r("option", {
										value: "",
										children: "— Select —"
									}), n.map((e) => {
										let t = typeof e.value == "object" ? String(u(e.value)) : String(e.value ?? "");
										return /* @__PURE__ */ r("option", {
											value: t,
											children: e.label
										}, t);
									})]
								}) : e.options && e.depend_on ? /* @__PURE__ */ r("select", {
									className: "lg-select",
									disabled: !0,
									children: /* @__PURE__ */ r("option", { children: "— Select parent first —" })
								}) : /* @__PURE__ */ r("input", {
									type: [
										"INTEGER",
										"BIGINT",
										"FLOAT",
										"DOUBLE PRECISION"
									].includes(e.value_type) ? "number" : "text",
									className: "lg-input",
									value: String(t ?? ""),
									onChange: (t) => M(e.name, t.target.value),
									placeholder: e.label
								})]
							}, e.name);
						})
					}),
					/* @__PURE__ */ r("button", {
						className: "lg-form-save-btn",
						onClick: async () => {
							if (m) {
								D(!0);
								try {
									await l(m.groups.map((e, t) => ({
										templates_group_name: e.templates_group_name,
										campaign_template_id: e.campaign_template_id,
										...m.campaignValues[t],
										adset_templates: e.adset_templates.map((e, n) => ({
											adset_template_id: e.adset_template_id,
											...m.adsetValues[t][n],
											ad_templates: e.ad_templates.map((e, r) => ({
												ad_template_id: e.ad_template_id,
												...m.adValues[t][n][r]
											}))
										}))
									})));
								} finally {
									D(!1);
								}
							}
						},
						disabled: E,
						children: E ? "Saving..." : "Save"
					})
				]
			}) : /* @__PURE__ */ r("div", {
				className: "lg-form-panel lg-form-panel--empty",
				children: /* @__PURE__ */ r("span", {
					className: "lg-placeholder",
					children: "Select nodes of the same level to bulk edit"
				})
			}),
			/* @__PURE__ */ r("div", {
				className: "lg-groups-list",
				children: m.groups.map((e, t) => {
					let n = e.adset_templates.reduce((e, t) => e + t.ad_templates.length, 0), a = e.adset_templates.length;
					return /* @__PURE__ */ i("div", {
						className: "lg-group-block",
						children: [/* @__PURE__ */ r("div", {
							className: "lg-group-label",
							children: e.templates_group_name
						}), /* @__PURE__ */ i("div", {
							className: "lg-graph",
							children: [
								/* @__PURE__ */ r("div", {
									className: "lg-col",
									children: /* @__PURE__ */ i("div", {
										className: `lg-block lg-block-campaign ${k({
											groupIndex: t,
											level: "campaign"
										}) ? "lg-block--selected" : ""}`,
										onClick: () => A({
											groupIndex: t,
											level: "campaign"
										}),
										children: [
											/* @__PURE__ */ r("span", {
												className: "lg-block-type",
												children: "Campaign"
											}),
											/* @__PURE__ */ i("span", {
												className: "lg-block-id",
												children: ["#", e.campaign_template_id]
											}),
											p(m.campaignValues[t]) && /* @__PURE__ */ r("span", { className: "lg-filled-dot" })
										]
									})
								}),
								/* @__PURE__ */ r("div", {
									className: "lg-conn",
									children: /* @__PURE__ */ r("svg", {
										className: "lg-conn-svg",
										preserveAspectRatio: "none",
										children: e.adset_templates.map((e, t) => /* @__PURE__ */ r("line", {
											className: "lg-conn-line",
											x1: "0",
											y1: "50%",
											x2: "100%",
											y2: `${a === 1 ? 50 : t / (a - 1) * 100}%`
										}, t))
									})
								}),
								/* @__PURE__ */ r("div", {
									className: "lg-col",
									children: e.adset_templates.map((e, n) => /* @__PURE__ */ i("div", {
										className: `lg-block lg-block-adset ${k({
											groupIndex: t,
											adsetIndex: n,
											level: "adset"
										}) ? "lg-block--selected" : ""}`,
										onClick: () => A({
											groupIndex: t,
											adsetIndex: n,
											level: "adset"
										}),
										children: [
											/* @__PURE__ */ r("span", {
												className: "lg-block-type",
												children: "Adset"
											}),
											/* @__PURE__ */ i("span", {
												className: "lg-block-id",
												children: ["#", e.adset_template_id]
											}),
											p(m.adsetValues[t]?.[n] ?? {}) && /* @__PURE__ */ r("span", { className: "lg-filled-dot" })
										]
									}, n))
								}),
								/* @__PURE__ */ r("div", {
									className: "lg-conn",
									children: /* @__PURE__ */ r("svg", {
										className: "lg-conn-svg",
										preserveAspectRatio: "none",
										children: (() => {
											let t = 0;
											return e.adset_templates.map((e, i) => {
												let o = a === 1 ? 50 : i / (a - 1) * 100;
												return e.ad_templates.map((e, a) => {
													let s = n === 1 ? 50 : t / (n - 1) * 100;
													return t++, /* @__PURE__ */ r("line", {
														className: "lg-conn-line",
														x1: "0",
														y1: `${o}%`,
														x2: "100%",
														y2: `${s}%`
													}, `${i}-${a}`);
												});
											});
										})()
									})
								}),
								/* @__PURE__ */ r("div", {
									className: "lg-col",
									children: e.adset_templates.map((e, n) => e.ad_templates.map((e, a) => /* @__PURE__ */ i("div", {
										className: `lg-block lg-block-ad ${k({
											groupIndex: t,
											adsetIndex: n,
											adIndex: a,
											level: "ad"
										}) ? "lg-block--selected" : ""}`,
										onClick: () => A({
											groupIndex: t,
											adsetIndex: n,
											adIndex: a,
											level: "ad"
										}),
										children: [
											/* @__PURE__ */ r("span", {
												className: "lg-block-type",
												children: "Ad"
											}),
											/* @__PURE__ */ i("span", {
												className: "lg-block-id",
												children: ["#", e.ad_template_id]
											}),
											p(m.adValues[t]?.[n]?.[a] ?? {}) && /* @__PURE__ */ r("span", { className: "lg-filled-dot" })
										]
									}, `${n}-${a}`)))
								})
							]
						})]
					}, t);
				})
			})
		]
	}) : /* @__PURE__ */ r("div", {
		className: "lg-container",
		children: /* @__PURE__ */ r("button", {
			className: "lg-load-btn",
			onClick: O,
			disabled: w,
			children: w ? "Loading..." : "Load Launch Data"
		})
	});
}
//#endregion
export { c as DynamicForm, m as LaunchGroup, l as TemplateGroup };
